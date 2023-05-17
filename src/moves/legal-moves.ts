import { reverseColor } from "@src/constants/Colors.js";
import { getCoords } from "@src/constants/Coords.js";
import Piece from "@src/constants/Piece.js";
import { CastledKingFiles, CastledRookFiles, InitialPawnRanks, InitialPieceRanks } from "@src/constants/placement.js";
import type Position from "@src/game/Position.js";
import offsets from "@src/moves/offsets.js";
import {
  Color,
  Coordinates,
  PieceMap,
  Wing
} from "@src/types.js";


export function* attackedCoords(srcCoords: Coordinates, color: Color, pieces: Record<Color, PieceMap>): Generator<Coordinates> {
  const piece = pieces[color].get(srcCoords) as Piece;
  const { x: xOffsets, y: yOffsets } = offsets[piece];
  let coords: Coordinates;

  for (let i = 0; i < xOffsets.length; i++) {
    let x = srcCoords.x + xOffsets[i];
    let y = srcCoords.y + yOffsets[i];

    while (x >= 0 && x < 8 && y >= 0 && y < 8) {
      coords = getCoords(x, y);
      yield coords;
      if (piece < Piece.BISHOP || pieces[color].has(coords) || pieces[reverseColor(color)].has(coords))
        break;
      x += xOffsets[i];
      y += yOffsets[i];
    }
  }
}

function* pseudoLegalForwardPawnMoves(srcCoords: Coordinates, color: Color, xOffset: number, pieces: Record<Color, PieceMap>) {
  const forwardCoords = getCoords(srcCoords.x + xOffset, srcCoords.y);

  if (!pieces[color].has(forwardCoords) && !pieces[reverseColor(color)].has(forwardCoords)) {
    yield forwardCoords;

    if (srcCoords.x === InitialPawnRanks[color]) {
      const forwardCoords = getCoords(srcCoords.x + xOffset * 2, srcCoords.y);
      if (!pieces[color].has(forwardCoords) && !pieces[reverseColor(color)].has(forwardCoords))
        yield forwardCoords;
    }
  }
}

export function* pseudoLegalMoves(
  srcCoords: Coordinates,
  color: Color,
  pieces: Record<Color, PieceMap>,
  enPassantCoords: Coordinates | null
): Generator<Coordinates> {
  const piece = pieces[color].get(srcCoords) as Piece;

  if (piece >= Piece.KNIGHT) {
    for (const destCoords of attackedCoords(srcCoords, color, pieces))
      if (!pieces[color].has(destCoords))
        yield destCoords;
    return;
  }

  yield* pseudoLegalForwardPawnMoves(srcCoords, color, offsets[piece].x[0], pieces);

  for (const destCoords of attackedCoords(srcCoords, color, pieces))
    if (pieces[reverseColor(color)].has(destCoords) || destCoords === enPassantCoords)
      yield destCoords;
}

export function canCastleTo(rookY: number, color: Color, coordsAttackedByInactiveColor: Set<Coordinates>, pos: Position): boolean {
  const kingY = pos.pieces[color].kingCoords.y;
  const wing = Math.sign(rookY - kingY) as Wing;
  const kingYOffset = Math.sign(CastledKingFiles[wing] - kingY);
  const rookYOffset = Math.sign(CastledRookFiles[wing] - kingY);
  let i: number, coords: Coordinates;

  for (i = 1; i <= Math.abs(CastledKingFiles[wing] - kingY); i++) {
    coords = getCoords(InitialPieceRanks[color], kingY + kingYOffset * i);
    if (
      coordsAttackedByInactiveColor.has(coords)
      || pos.pieces[reverseColor(color)].has(coords)
      || pos.pieces[color].has(coords) && pos.pieces[color].get(coords) !== Piece.ROOK
    )
      return false;
  }

  for (i = 1; i <= Math.abs(CastledRookFiles[wing] - rookY); i++) {
    coords = getCoords(InitialPieceRanks[color], rookY + rookYOffset * i);
    if (
      pos.pieces[reverseColor(color)].has(coords)
      || pos.pieces[color].has(coords) && pos.pieces[color].get(coords) !== Piece.KING
    )
      return false;
  }

  return true;
}