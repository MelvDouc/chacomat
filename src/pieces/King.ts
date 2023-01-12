import Wing from "../constants/Wing.js";
import Piece from "./_Piece.js";
import type {
  Board,
  CastlingRights,
  CoordsGenerator,
  Coords,
  Position,
  Wings
} from "../types.js";

export default class King extends Piece {
  public static readonly whiteInitial = "K";

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
    const rookCoords = board.Coords.get(X, board.startRookFiles[wing])!;

    // The squares traversed by the king must not be attacked,
    // and they must be either empty or occupied by the castling rook.
    const kingDirection = Math.sign(King.castledKingFiles[wing] - Y);

    for (let y = Y + kingDirection; ; y += kingDirection) {
      const destCoords = board.Coords.get(X, y)!;
      if (
        (attackedCoords.has(destCoords) || !!board.get(destCoords))
        && destCoords !== rookCoords
      )
        return false;
      if (y === King.castledKingFiles[wing])
        break;
    }

    // The squares traversed by the rook must be empty or occupied the king.
    const rookDirection = Math.sign(Piece.castledRookFiles[wing] - rookCoords.y);

    for (let y = rookCoords.y + rookDirection; ; y += rookDirection) {
      const destCoords = board.Coords.get(X, y)!;
      if (!!board.get(destCoords) && destCoords !== kingCoords)
        return false;
      if (y === Piece.castledRookFiles[wing])
        break;
    }

    return true;
  }

  public *castlingCoords(kingCoords: Coords, attackedCoords: Set<Coords>, position: Position): CoordsGenerator {
    for (const wing of [Wing.QUEEN_SIDE, Wing.KING_SIDE]) {
      if (
        this.canCastleToWing({
          wing,
          kingCoords,
          attackedCoords,
          castlingRights: position.castlingRights,
          board: position.board
        })
      ) {
        const y = (position.game.isChess960)
          ? position.board.startRookFiles[wing]
          : King.castledKingFiles[wing];
        yield position.board.Coords.get(kingCoords.x, y)!;
      }
    }
  }
}