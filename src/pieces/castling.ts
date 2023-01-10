import Wing from "../constants/Wing.js";
import type {
  AttackedCoordsRecord,
  Board,
  Color,
  Coords,
  CoordsGenerator,
  CastlingRights,
  Position,
} from "../types.js";

const wings = [Wing.QUEEN_SIDE, Wing.KING_SIDE];
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
    castlingRights: CastlingRights;
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
    if (board.get({ x: kingCoords.x, y: file }) !== null) {
      return false;
    }
    // If a square traversed by the king is controlled by the enemy color.
    if (
      CASTLED_KING_FILES[wing] - file !== -direction
      && kingCoords.x in attackedCoords
      && attackedCoords[kingCoords.x][file]
    ) {
      return false;
    }
  }

  return true;
}

function* castlingCoords(kingCoords: Coords, position: Position): CoordsGenerator {
  const attackedCoords = position.board.getCoordsAttackedByColor(-position.colorToMove as Color);

  for (const wing of wings)
    if (
      canCastleToWing({
        color: position.colorToMove,
        wing,
        kingCoords,
        attackedCoords,
        castlingRights: position.castlingRights,
        board: position.board,
      })
    )
      yield {
        x: kingCoords.x,
        y: CASTLED_KING_FILES[wing],
      };
}

export default castlingCoords;
