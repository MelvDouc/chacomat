import Wing from "../constants/Wing.js";
import type {
  AttackedCoordsRecord,
  Board,
  Color,
  Coords,
  CoordsGenerator,
  ICastlingRights,
  Position,
} from "../types.js";

const initialFile = 4;

const CASTLED_KING_FILES = {
  [Wing.QUEEN_SIDE]: 2,
  [Wing.KING_SIDE]: 6,
};

/**
 * This assumes that the king's coordinates are in keeping with the position's castling rights.
 */
function canCastleToWing(
  { color, wing, castlingRights, attackedCoords, board, kingCoords }: {
    color: Color;
    wing: Wing;
    kingCoords: Coords;
    castlingRights: ICastlingRights;
    attackedCoords: AttackedCoordsRecord;
    board: Board;
  },
): boolean {
  if (!castlingRights[color][wing]) {
    return false;
  }

  const direction = Math.sign(wing - initialFile);
  for (
    let file = initialFile + direction;
    file !== wing;
    file += direction
  ) {
    console.log(kingCoords);
    if (board[kingCoords.x][file]) {
      return false;
    }
    // If a square traversed by the king is controlled by the enemy color.
    if (
      CASTLED_KING_FILES[wing] - file !== -direction &&
      attackedCoords[kingCoords.x][file]
    ) {
      return false;
    }
  }

  return true;
}

function* castlingIndices(
  kingCoords: Coords,
  position: Position,
): CoordsGenerator {
  for (const wing of [Wing.QUEEN_SIDE, Wing.KING_SIDE]) {
    if (
      canCastleToWing({
        color: position.colorToMove,
        wing,
        kingCoords,
        attackedCoords: position.attackedCoords,
        castlingRights: position.castlingRights,
        board: position.board,
      })
    ) {
      yield {
        x: kingCoords.x,
        y: CASTLED_KING_FILES[wing],
      };
    }
  }
}

export default castlingIndices;
