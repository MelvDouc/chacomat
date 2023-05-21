import Colors from "@src/constants/Colors.js";
import { coordsToNotation, getCoords } from "@src/constants/Coords.js";
import Piece from "@src/constants/Piece.js";
import { CastledRookFiles, InitialPieceRanks } from "@src/constants/placement.js";
import {
  Board,
  Color,
  Coordinates,
  Position,
  PromotedPiece,
  Wing
} from "@src/types.js";

export default function playMove(
  position: Position,
  srcCoords: Coordinates,
  destCoords: Coordinates,
  promotedPiece?: PromotedPiece
): Position {
  if (!position.legalMoves.some(([src, dest]) => src === srcCoords && dest === destCoords))
    throw new Error(`Illegal move: ${coordsToNotation(srcCoords)}-${coordsToNotation(destCoords)}`);

  const { activeColor, inactiveColor, enPassantCoords, halfMoveClock, fullMoveNumber } = position;
  const board = position.board.clone();
  const castlingRights = structuredClone(position.castlingRights);

  let srcPiece = board.get(activeColor, srcCoords) as Piece;
  const isPawn = srcPiece < Piece.KNIGHT;
  const captureCoords = (!isPawn || destCoords !== enPassantCoords)
    ? destCoords
    : getCoords(srcCoords.x, destCoords.y);
  const capturedPiece = board.get(inactiveColor, captureCoords);

  if (srcPiece === Piece.ROOK && srcCoords.x === InitialPieceRanks[activeColor])
    castlingRights[activeColor].delete(srcCoords.y);

  // unset castling rights on rook capture
  if (capturedPiece === Piece.ROOK && destCoords.x === InitialPieceRanks[inactiveColor])
    castlingRights[inactiveColor].delete(destCoords.y);

  if (srcPiece === Piece.KING) {
    if (position.isCastlingMove(srcCoords, destCoords))
      handleCastling(srcCoords, destCoords, activeColor, board, castlingRights);
    castlingRights[activeColor].clear();
  }

  if (isPawn && destCoords.x === InitialPieceRanks[inactiveColor])
    srcPiece = promotedPiece ?? Piece.QUEEN;

  board.set(activeColor, destCoords, srcPiece).delete(activeColor, srcCoords);
  board.delete(inactiveColor, captureCoords);

  return new (position.constructor as typeof Position)({
    board,
    castlingRights,
    activeColor: inactiveColor,
    enPassantCoords: (isPawn && Math.abs(destCoords.x - srcCoords.x) === 2)
      ? getCoords((srcCoords.x + destCoords.x) / 2, srcCoords.y)
      : null,
    halfMoveClock: (isPawn || capturedPiece !== null) ? 0 : (halfMoveClock + 1),
    fullMoveNumber: fullMoveNumber + Number(inactiveColor === Colors.WHITE)
  });
}

function handleCastling(srcCoords: Coordinates, destCoords: Coordinates, color: Color, board: Board, castlingRights: Position["castlingRights"]): void {
  const wing = Math.sign(destCoords.y - srcCoords.y) as Wing;
  const rookY = [...castlingRights[color]].find((y) => Math.sign(y - srcCoords.y) === wing) as number;
  board.delete(color, getCoords(srcCoords.x, rookY));
  board.set(color, getCoords(srcCoords.x, CastledRookFiles[wing]), Piece.ROOK);
}