import type Color from "$src/game/Color.js";
import type Position from "$src/game/Position.js";
import { SquareIndex } from "$src/game/constants.js";
import CastlingMove from "$src/moves/CastlingMove.js";
import NullMove from "$src/moves/NullMove.js";
import PawnMove from "$src/moves/PawnMove.js";
import PieceMove from "$src/moves/PieceMove.js";
import Piece from "$src/pieces/Piece.js";
import Pieces from "$src/pieces/Pieces.js";
import type { Wing } from "$src/types.js";

const moveRegex = /^(?<pi>[BKNQR])?(?<sf>[a-h])?(?<sr>[1-8])?x?(?<dn>[a-h][1-8])(=?(?<pr>[QRBN]))?/;
const castlingRegex = /^(O|0)(-\1){1,2}/;

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

export function findMove(position: Position, notation: string) {
  if (castlingRegex.test(notation)) {
    const isQueenSide = notation[3] === "-";
    return new CastlingMove(position.activeColor, isQueenSide ? "queenSide" : "kingSide");
  }

  const matchArr = notation.match(moveRegex);

  if (!matchArr) {
    return (notation === NullMove.algebraicNotation)
      ? new NullMove()
      : null;
  }

  const { pi, sf, sr, dn, pr } = matchArr.groups as HalfMoveGroups;
  const piece = getPieceFromWhiteInitial(pi ?? "P", position.activeColor) as Piece;
  const destIndex = SquareIndex[dn as keyof typeof SquareIndex];

  for (const move of regularMoves(position)) {
    if (
      move.srcPiece === piece
      && move.destIndex === destIndex
      && (!sr || sr === move.srcPoint.rankNotation)
      && (!sf || sf === move.srcPoint.fileNotation)
      && (!pr || move instanceof PawnMove && move.promotionInitial === pr)
    )
      return move;
  }

  return null;
}

function getPieceFromWhiteInitial(initial: string, color: Color) {
  const piece = Pieces.fromInitial(initial);
  if (piece)
    return color.isWhite() ? piece : piece.opposite;
  return null;
}

type HalfMoveGroupKey = "pi" | "sf" | "sr" | "dn" | "pr";
type HalfMoveGroups = { [K in HalfMoveGroupKey]?: string };