import { castledFiles } from "@chacomat/pieces/placements.js";
import type { Piece } from "@chacomat/types.js";
import { Wing } from "@chacomat/utils/constants.js";
import { coordsToIndex } from "@chacomat/utils/Index.js";

/**
 * This assumes that the king's coordinates are in keeping with the position's castling rights.
 */
export function canCastleToFile(king: Piece, srcRookY: number): boolean {
  const { x: kingX, y: kingY } = king.coords;
  const wing = getWing(kingY, srcRookY);
  const rookIndex = coordsToIndex(kingX, srcRookY);

  // The squares traversed by the king must not be attacked,
  // and they must be either empty or occupied by the castling rook.
  const destKingY = castledFiles.KING[wing];
  const kingDirection = Math.sign(destKingY - kingY);

  if (kingDirection !== 0) {
    for (let y = kingY + kingDirection; ; y += kingDirection) {
      const destIndex = coordsToIndex(kingX, y);
      if (
        king.board.position.attackedIndicesSet.has(destIndex)
        || destIndex !== rookIndex && king.board.has(destIndex)
      )
        return false;
      if (y === destKingY)
        break;
    }
  }

  // The squares traversed by the rook must be empty or occupied the king.
  const destRookY = castledFiles.ROOK[wing];
  const rookDirection = Math.sign(destRookY - srcRookY);

  if (rookDirection !== 0) {
    for (let y = srcRookY + rookDirection; ; y += rookDirection) {
      const destIndex = coordsToIndex(kingX, y);
      if (destIndex !== king.index && king.board.has(destIndex))
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