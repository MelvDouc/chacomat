import Wing from "../constants/Wing.js";
import {
  AttackedCoordsRecord,
  Board,
  CastlingRights,
  Coords,
  CoordsGenerator,
  Position
} from "../types.js";
import Piece from "./_Piece.js";

export default class King extends Piece {
  public static readonly initial = "K";
  private static initialFile = 4;
  private static readonly castledFiles = {
    [Wing.QUEEN_SIDE]: 2,
    [Wing.KING_SIDE]: 6
  };

  /**
   * This assumes that the king's coordinates are in keeping with the position's castling rights.
   */
  private canCastleToWing({ wing, castlingRights, attackedCoords, board, kingCoords }: {
    wing: Wing;
    kingCoords: Coords;
    castlingRights: CastlingRights;
    attackedCoords: AttackedCoordsRecord;
    board: Board;
  }): boolean {
    if (!castlingRights[this.color][wing])
      return false;

    const direction = Math.sign(wing - King.initialFile);
    for (
      let file = King.initialFile + direction;
      file !== wing;
      file += direction
    ) {
      if (board.get({ x: kingCoords.x, y: file }) !== null)
        return false;
      // If a square traversed by the king is controlled by the enemy color.
      if (
        King.castledFiles[wing] - file !== -direction
        && kingCoords.x in attackedCoords
        && attackedCoords[kingCoords.x][file]
      )
        return false;
    }

    return true;
  }

  public *castlingCoords(kingCoords: Coords, attackedCoords: AttackedCoordsRecord, position: Position): CoordsGenerator {
    for (const wing of [Wing.QUEEN_SIDE, Wing.KING_SIDE])
      if (
        this.canCastleToWing({
          wing,
          kingCoords,
          attackedCoords,
          castlingRights: position.castlingRights,
          board: position.board
        })
      )
        yield {
          x: kingCoords.x,
          y: King.castledFiles[wing]
        };
  }
}