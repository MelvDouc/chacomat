import { castledFiles } from "@chacomat/pieces/placements.js";
import type {
  Board,
  Coords
} from "@chacomat/types.js";
import { Wing } from "@chacomat/utils/constants.js";

/**
 * This assumes that the king's coordinates are in keeping with the position's castling rights.
 */
export function canCastleToFile(
  { board, kingCoords }: { board: Board, kingCoords: Coords; },
  srcRookY: number
): boolean {
  const { x: kingX, y: kingY } = kingCoords;
  const wing = getWing(kingY, srcRookY);
  const rookCoords = board.Coords(kingX, srcRookY);

  // The squares traversed by the king must not be attacked,
  // and they must be either empty or occupied by the castling rook.
  const destKingY = castledFiles.KING[wing];
  const kingDirection = Math.sign(destKingY - kingY);

  if (kingDirection !== 0) {
    for (let y = kingY + kingDirection; ; y += kingDirection) {
      const destCoords = board.Coords(kingX, y);
      if (
        board.position.attackedCoordsSet.has(destCoords)
        || destCoords !== rookCoords && board.has(destCoords)
      )
        return false;
      if (y === destKingY)
        break;
    }
  }

  // The squares traversed by the rook must be empty or occupied the king.
  const destRookY = castledFiles.ROOK[wing];
  const rookDirection = Math.sign(destRookY - rookCoords.y);

  if (rookDirection !== 0) {
    for (let y = rookCoords.y + rookDirection; ; y += rookDirection) {
      const destCoords = board.Coords(kingX, y);
      if (destCoords !== kingCoords && board.has(destCoords))
        return false;
      if (y === destRookY)
        break;
    }
  }

  return true;
}

export function getWing(kingY: number, compareY: number): Wing {
  return (compareY < kingY)
    ? Wing.QUEEN_SIDE
    : Wing.KING_SIDE;
}