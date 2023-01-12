import Wing from "../constants/Wing.js";
import Piece from "./_Piece.js";
import type {
  Board,
  CastlingRights,
  CoordsGenerator,
  Coords,
  Position
} from "../types.js";

export default class King extends Piece {
  public static readonly whiteInitial = "K";
  public static startFiles = [4];
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
    attackedCoords: Set<Coords>;
    board: Board;
  }): boolean {
    if (!castlingRights[this.color][wing])
      return false;

    const direction = Math.sign(wing - King.startFiles[0]);
    for (
      let file = King.startFiles[0] + direction;
      file !== wing;
      file += direction
    ) {
      const castlingCoords = board.Coords.get(kingCoords.x, file)!;
      if (board.get(castlingCoords) !== null)
        return false;
      // If a square traversed by the king is controlled by the enemy color.
      if (
        King.castledFiles[wing] - file !== -direction
        && attackedCoords.has(castlingCoords)
      )
        return false;
    }

    return true;
  }

  public *castlingCoords(kingCoords: Coords, attackedCoords: Set<Coords>, position: Position): CoordsGenerator {
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
        yield position.board.Coords.get(kingCoords.x, King.castledFiles[wing])!;
  }
}