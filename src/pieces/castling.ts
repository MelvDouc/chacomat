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
    if (board[kingCoords.x][file] !== null) {
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
  const attackedCoords = position.board.getAttackedCoords(-position.colorToMove as Color);

  for (const wing of [Wing.QUEEN_SIDE, Wing.KING_SIDE])
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
