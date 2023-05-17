import Colors from "@src/constants/Colors.js";
import { coordsToNotation, getCoords } from "@src/constants/Coords.js";
import Piece from "@src/constants/Piece.js";
import { CastledRookFiles, InitialPieceRanks } from "@src/constants/placement.js";
import {
  Coordinates,
  PieceMap,
  Position,
  PositionInfo,
  PromotedPiece,
  Wing
} from "@src/types.js";

export default function playMove(
  {
    pieces,
    castlingRights,
    activeColor,
    inactiveColor,
    enPassantCoords,
    halfMoveClock,
    fullMoveNumber,
    legalMoves
  }: ReturnType<Position["cloneInfo"]>,
  srcCoords: Coordinates,
  destCoords: Coordinates,
  promotedPiece?: PromotedPiece
): PositionInfo {
  if (!legalMoves.some(([src, dest]) => src === srcCoords && dest === destCoords))
    throw new Error(`Illegal move: ${coordsToNotation(srcCoords)}-${coordsToNotation(destCoords)}`);

  let srcPiece = pieces[activeColor].get(srcCoords) as Piece;
  const isPawn = srcPiece < Piece.KNIGHT;
  const captureCoords = (!isPawn || destCoords !== enPassantCoords)
    ? destCoords
    : getCoords(srcCoords.x, destCoords.y);
  const capturedPiece = pieces[inactiveColor].get(captureCoords);

  if (srcPiece === Piece.ROOK && srcCoords.x === InitialPieceRanks[activeColor])
    castlingRights[activeColor].delete(srcCoords.y);

  // unset castling rights on rook capture
  if (capturedPiece === Piece.ROOK && destCoords.x === InitialPieceRanks[inactiveColor])
    castlingRights[inactiveColor].delete(destCoords.y);

  if (srcPiece === Piece.KING)
    handleKingMove(srcCoords, destCoords, pieces[activeColor], castlingRights[activeColor]);

  if (isPawn && destCoords.x === InitialPieceRanks[inactiveColor])
    srcPiece = promotedPiece ?? Piece.QUEEN;

  pieces[activeColor].set(destCoords, srcPiece).delete(srcCoords);
  pieces[inactiveColor].delete(captureCoords);

  return {
    pieces,
    castlingRights,
    activeColor: inactiveColor,
    enPassantCoords: (isPawn && Math.abs(destCoords.x - srcCoords.x) === 2)
      ? getCoords((srcCoords.x + destCoords.x) / 2, srcCoords.y)
      : null,
    halfMoveClock: (isPawn || capturedPiece !== undefined) ? 0 : (halfMoveClock + 1),
    fullMoveNumber: fullMoveNumber + Number(inactiveColor === Colors.WHITE)
  };
}

function isCastling(srcCoords: Coordinates, destCoords: Coordinates, pieceMap: PieceMap): boolean {
  return Math.abs(srcCoords.y - destCoords.y) === 2 || pieceMap.get(destCoords) === Piece.ROOK;
}

function handleKingMove(srcCoords: Coordinates, destCoords: Coordinates, pieceMap: PieceMap, castlingRights: Set<number>): void {
  if (isCastling(srcCoords, destCoords, pieceMap)) {
    const wing = Math.sign(destCoords.y - srcCoords.y) as Wing;
    const rookY = [...castlingRights].find((y) => Math.sign(y - srcCoords.y) === wing) as number;
    pieceMap.delete(getCoords(srcCoords.x, rookY));
    pieceMap.set(getCoords(srcCoords.x, CastledRookFiles[wing]), Piece.ROOK);
  }

  castlingRights.clear();
}