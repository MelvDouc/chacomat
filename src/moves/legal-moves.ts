import { ReversedColors } from "@src/constants/Colors.js";
import { getCoords } from "@src/constants/Coords.js";
import Piece from "@src/constants/Piece.js";
import { CastledKingFiles, CastledRookFiles, InitialPawnRanks, InitialPieceRanks } from "@src/constants/placement.js";
import offsets from "@src/moves/offsets.js";
import {
  Board,
  Color,
  Coordinates,
  Wing
} from "@src/types.js";


export function* attackedCoords(srcCoords: Coordinates, color: Color, board: Board): Generator<Coordinates> {
  const piece = board.get(color, srcCoords) as Piece;
  const { x: xOffsets, y: yOffsets } = offsets[piece];
  let coords: Coordinates;

  for (let i = 0; i < xOffsets.length; i++) {
    let x = srcCoords.x + xOffsets[i];
    let y = srcCoords.y + yOffsets[i];

    while (x >= 0 && x < 8 && y >= 0 && y < 8) {
      coords = getCoords(x, y);
      yield coords;
      if (piece < Piece.BISHOP || board.has(coords))
        break;
      x += xOffsets[i];
      y += yOffsets[i];
    }
  }
}

function* pseudoLegalForwardPawnMoves(srcCoords: Coordinates, color: Color, xOffset: number, board: Board) {
  const forwardCoords = getCoords(srcCoords.x + xOffset, srcCoords.y);

  if (!board.has(forwardCoords)) {
    yield forwardCoords;

    if (srcCoords.x === InitialPawnRanks[color]) {
      const forwardCoords = getCoords(srcCoords.x + xOffset * 2, srcCoords.y);
      if (!board.has(forwardCoords))
        yield forwardCoords;
    }
  }
}

export function* pseudoLegalMoves(
  srcCoords: Coordinates,
  color: Color,
  board: Board,
  enPassantCoords: Coordinates | null
): Generator<Coordinates> {
  const piece = board.get(color, srcCoords) as Piece;

  if (piece >= Piece.KNIGHT) {
    for (const destCoords of attackedCoords(srcCoords, color, board))
      if (!board.has(destCoords, color))
        yield destCoords;
    return;
  }

  yield* pseudoLegalForwardPawnMoves(srcCoords, color, offsets[piece].x[0], board);

  for (const destCoords of attackedCoords(srcCoords, color, board))
    if (board.has(destCoords, ReversedColors[color]) || destCoords === enPassantCoords)
      yield destCoords;
}

export function canCastleTo(rookY: number, color: Color, board: Board, coordsAttackedByInactiveColor: Set<Coordinates>): boolean {
  const kingY = board.getKingCoords(color).y;
  const wing = Math.sign(rookY - kingY) as Wing;
  const kingYOffset = Math.sign(CastledKingFiles[wing] - kingY);
  const rookYOffset = Math.sign(CastledRookFiles[wing] - kingY);
  let i: number, coords: Coordinates;

  for (i = 1; i <= Math.abs(CastledKingFiles[wing] - kingY); i++) {
    coords = getCoords(InitialPieceRanks[color], kingY + kingYOffset * i);
    if (
      coordsAttackedByInactiveColor.has(coords)
      || board.has(coords, ReversedColors[color])
      || board.has(coords, color) && board.get(color, coords) !== Piece.ROOK
    )
      return false;
  }

  for (i = 1; i <= Math.abs(CastledRookFiles[wing] - rookY); i++) {
    coords = getCoords(InitialPieceRanks[color], rookY + rookYOffset * i);
    if (
      board.has(coords, ReversedColors[color])
      || board.has(coords, color) && board.get(color, coords) !== Piece.KING
    )
      return false;
  }

  return true;
}