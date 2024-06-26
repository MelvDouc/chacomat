import type ChessGame from "$src/game/ChessGame.js";
import type Color from "$src/game/Color.js";
import { indexToPointTable, pointTable } from "$src/game/Point.js";
import type Position from "$src/game/Position.js";
import CastlingMove from "$src/moves/CastlingMove.js";
import NullMove from "$src/moves/NullMove.js";
import PawnMove from "$src/moves/PawnMove.js";
import PieceMove from "$src/moves/PieceMove.js";
import Piece from "$src/pieces/Piece.js";
import Pieces from "$src/pieces/Pieces.js";
import type { Wing } from "$src/types.js";
import { IllegalMoveError } from "$src/utils/errors.js";
import type { PGNify } from "pgnify";

export function* regularMoves({ board, activeColor, enPassantIndex }: Position) {
  for (const [srcIndex, piece] of board.getEntries()) {
    if (piece.color !== activeColor)
      continue;

    for (const destIndex of piece.getPseudoLegalDestIndices({ board, srcIndex, enPassantIndex })) {
      const isEnPassant = destIndex === enPassantIndex;
      const move = piece.isPawn()
        ? new PawnMove(
          srcIndex,
          destIndex,
          piece,
          isEnPassant ? piece.opposite : board.get(destIndex),
          isEnPassant
        )
        : new PieceMove(srcIndex, destIndex, piece, board.get(destIndex));
      move.play(board);
      const isLegal = !board.isKingEnPrise(activeColor);
      move.undo(board);

      if (isLegal) {
        if (move instanceof PawnMove && move.isPromotion())
          yield* move.promotions();
        else
          yield move;
      }
    }
  }
}

export function* castlingMoves({ activeColor, board, castlingRights }: Position) {
  const enemyAttacks = board.getColorAttacks(activeColor.opposite);

  if (enemyAttacks.has(board.getKingIndex(activeColor)))
    return;

  const rights = castlingRights.get(activeColor);
  let wing: Wing;

  for (wing in rights) {
    if (!rights[wing]) continue;
    const move = new CastlingMove(activeColor, wing);
    if (move.isLegal(board, enemyAttacks))
      yield move;
  }
}

export function playMoves(game: ChessGame, line: PGNify.Variation) {
  for (const { commentAfter, commentBefore, move: m, NAG, variations } of line) {
    const posBefore = game.currentPosition;
    const move = findMove(game.currentPosition, m);

    if (!move) {
      throw new IllegalMoveError("Illegal move.", {
        cause: {
          move: m,
          position: posBefore
        }
      });
    }

    commentBefore && (move.commentBefore = commentBefore);
    commentAfter && (move.commentAfter = commentAfter);
    NAG && (move.NAG = NAG);
    game.playMove(move);
    const posAfter = game.currentPosition;

    if (variations) {
      variations.forEach((variation) => {
        game.currentPosition = posBefore;
        playMoves(game, variation);
      });
      game.currentPosition = posAfter;
    }
  }
}

function findMove(position: Position, detail: PGNify.Move) {
  const { activeColor, board } = position;

  switch (detail.type) {
    case "piece-move": {
      const piece = getPieceFromWhiteInitial(detail.pieceInitial, activeColor) as Piece;
      const destIndex = pointTable[detail.destY][detail.destX].index;
      for (const srcIndex of piece.getAttacks(destIndex, board)) {
        if (
          board.get(srcIndex) === piece
          && (detail.srcX == null || indexToPointTable[srcIndex].x === detail.srcX)
          && (detail.srcY == null || indexToPointTable[srcIndex].y === detail.srcY)
        ) {
          const move = new PieceMove(srcIndex, destIndex, piece, board.get(destIndex));
          move.play(board);
          const isLegal = !board.isKingEnPrise(activeColor);
          move.undo(board);
          if (isLegal)
            return move;
        }
      }
      break;
    }
    case "pawn-move": {
      const destIndex = pointTable[detail.destY][detail.destX].index;
      for (const move of regularMoves(position)) {
        if (
          move instanceof PawnMove
          && move.destIndex === destIndex
          && move.srcPoint.x === detail.srcX
          && (!detail.promotionInitial || move.promotionInitial === detail.promotionInitial)
        )
          return move;
      }
      break;
    }
    case "castling": {
      for (const move of castlingMoves(position))
        if (move.isQueenSide() === detail.isQueenSide)
          return move;
      break;
    }
    case "unknown": {
      if (detail.notation === NullMove.algebraicNotation)
        return new NullMove();
    }
  }

  return null;
}

function getPieceFromWhiteInitial(initial: string, color: Color) {
  const piece = Pieces.fromInitial(initial);
  if (piece)
    return color.isWhite() ? piece : piece.opposite;
  return null;
}