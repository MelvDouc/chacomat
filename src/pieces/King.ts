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

    const { x: X, y: Y } = kingCoords;

    // Check if squares between king and rook are empty.
    const dirToRook = Math.sign(wing - X);

    for (let y = Y + dirToRook; y !== wing; y += dirToRook) {
      const destCoords = board.Coords.get(X, y)!,
        piece = board.get(destCoords);
      if (piece?.whiteInitial === "R" && piece.color === this.color)
        break;
      if (piece)
        return false;
    }

    // Check if no square traversed by the king is attacked by the other color.
    const castledKingFile = King.castledFiles[wing];
    const castlingDir = Math.sign(castledKingFile - X);

    for (let y = Y + castlingDir; ; y += castlingDir) {
      const destCoords = board.Coords.get(X, y)!;
      if (attackedCoords.has(destCoords))
        return false;
      if (y === castledKingFile)
        break;
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