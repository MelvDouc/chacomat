import type Position from "$src/game/Position.js";
import CastlingMove from "$src/moves/CastlingMove.js";
import NullMove from "$src/moves/NullMove.js";
import PawnMove from "$src/moves/PawnMove.js";
import PieceMove from "$src/moves/PieceMove.js";
import type Piece from "$src/pieces/Piece.js";
import Pieces from "$src/pieces/Pieces.js";
import type { Wing } from "$src/typings/types.js";

const moveRegex = /^(?<pi>[BKNQR])?(?<sf>[a-h])?(?<sr>[1-8])?x?(?<dc>[a-h][1-8])(=?(?<pr>[QRBN]))?/;
const castlingRegex = /^(?<o>[0O])(-\k<o>){1,2}/;

export function* nonCastlingMoves(position: Position) {
  const { board, activeColor, enPassantIndex } = position;

  for (const [srcIndex, piece] of board.getEntries()) {
    if (piece.color !== activeColor)
      continue;

    for (const destIndex of piece.getPseudoLegalDestIndices({ board, srcIndex, enPassantIndex })) {
      const isEnPassant = destIndex === enPassantIndex;
      const move = piece.isPawn()
        ? new PawnMove({
          srcIndex,
          destIndex,
          srcPiece: piece,
          destPiece: isEnPassant ? piece.opposite : board.get(destIndex),
          isEnPassant
        })
        : new PieceMove({
          srcIndex,
          destIndex,
          srcPiece: piece,
          destPiece: board.get(destIndex)
        });
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

  const rights = activeColor.isWhite()
    ? castlingRights.white
    : castlingRights.black;
  let wing: Wing;

  for (wing in rights) {
    if (!rights[wing]) continue;
    const move = new CastlingMove({ color: activeColor, wing });
    if (move.isLegal(board, enemyAttacks))
      yield move;
  }
}

export function findMove(position: Position, notation: string) {
  if (castlingRegex.test(notation)) {
    const isQueenSide = notation[3] === "-";
    return [...castlingMoves(position)].find((move) => {
      return move.isQueenSide() === isQueenSide;
    });
  }

  const matchArr = notation.match(moveRegex);

  if (!matchArr) {
    return (notation === NullMove.algebraicNotation)
      ? NullMove.instance
      : null;
  }

  const { pi, sf, sr, dc, pr } = matchArr.groups as HalfMoveGroups;
  let piece = Pieces.fromInitial(pi ?? "P") as Piece;
  if (!position.activeColor.isWhite()) piece = piece.opposite;

  for (const move of nonCastlingMoves(position)) {
    if (
      move.srcPiece === piece
      && move.destNotation === dc
      && (!sf || move.srcNotation[0] === sf)
      && (!sr || move.srcNotation[1] === sr)
      && (!(move instanceof PawnMove) || !move.isPromotion() || move.promotionInitial === pr)
    ) {
      return move;
    }
  }

  return null;
}

type HalfMoveGroupKey = "pi" | "sf" | "sr" | "dc" | "pr";
type HalfMoveGroups = { [K in HalfMoveGroupKey]?: string };