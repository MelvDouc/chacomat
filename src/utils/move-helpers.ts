import type Color from "$src/game/Color.js";
import { SquareIndex } from "$src/game/constants.js";
import type Position from "$src/game/Position.js";
import CastlingMove from "$src/moves/CastlingMove.js";
import NullMove from "$src/moves/NullMove.js";
import PawnMove from "$src/moves/PawnMove.js";
import PieceMove from "$src/moves/PieceMove.js";
import Piece from "$src/pieces/Piece.js";
import Pieces from "$src/pieces/Pieces.js";
import type { Wing } from "$src/types.js";

const moveRegex = /^(?<pi>[BKNQR])?(?<sf>[a-h])?(?<sr>[1-8])?x?(?<dn>[a-h][1-8])(=?(?<pr>[QRBN]))?/;
const castlingRegex = /^(O|0)(-\1){1,2}/;

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

  const rights = castlingRights.get(activeColor);
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
    return new CastlingMove({
      color: position.activeColor,
      wing: isQueenSide ? "queenSide" : "kingSide"
    });
  }

  const matchArr = notation.match(moveRegex);

  if (!matchArr) {
    return (notation === NullMove.algebraicNotation)
      ? NullMove.instance
      : null;
  }

  const { pi, sf, sr, dn, pr } = matchArr.groups as HalfMoveGroups;
  const destIndex = SquareIndex[dn as keyof typeof SquareIndex];

  if (pi) {
    const piece = getPieceFromWhiteInitial(pi, position.activeColor) as Piece;
    return piece.getMoveTo({ destIndex, position, srcFile: sf, srcRank: sr });
  }

  const pawn = position.activeColor.isWhite() ? Pieces.WHITE_PAWN : Pieces.BLACK_PAWN;
  const move = pawn.getMoveTo({ destIndex, position, srcFile: sf, srcRank: sr });

  if (move && pr) {
    const promotedPiece = getPieceFromWhiteInitial(pr, position.activeColor) as Piece;
    move.setPromotedPiece(promotedPiece);
  }

  return move;
}

function getPieceFromWhiteInitial(initial: string, color: Color) {
  const piece = Pieces.fromInitial(initial);
  return (piece && !color.isWhite())
    ? piece.opposite
    : piece;
}

type HalfMoveGroupKey = "pi" | "sf" | "sr" | "dn" | "pr";
type HalfMoveGroups = { [K in HalfMoveGroupKey]?: string };