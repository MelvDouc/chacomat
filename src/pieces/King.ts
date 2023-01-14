import Piece from "@pieces/Piece.js";
import { Wing } from "@utils/constants.js";
import { adjacentOffsets } from "@utils/sliding-offsets.js";
import { CoordsGenerator } from "../types.js";

export default class King extends Piece {
  public static override readonly whiteInitial = "K";
  protected static override readonly offsets = adjacentOffsets;

  /**
   * This assumes that the king's coordinates are in keeping with the position's castling rights.
   */
  private canCastleToWing(wing: Wing): boolean {
    if (!this.board.position.castlingRights[this.color][wing])
      return false;

    const { x: X, y: Y } = this.coords;
    const rookCoords = this.board.Coords.get(X, this.board.startRookFiles[wing]);

    // The squares traversed by the king must not be attacked,
    // and they must be either empty or occupied by the castling rook.
    const kingDirection = Math.sign(King.castledKingFiles[wing] - Y);

    for (let y = Y + kingDirection; ; y += kingDirection) {
      const destCoords = this.board.Coords.get(X, y);
      if (
        (this.board.position.attackedCoordsSet.has(destCoords) || this.board.has(destCoords))
        && destCoords !== rookCoords
      )
        return false;
      if (y === King.castledKingFiles[wing])
        break;
    }

    // The squares traversed by the rook must be empty or occupied the king.
    const rookDirection = Math.sign(Piece.castledRookFiles[wing] - rookCoords.y);

    for (let y = rookCoords.y + rookDirection; ; y += rookDirection) {
      const destCoords = this.board.Coords.get(X, y);
      if (this.board.has(destCoords) && destCoords !== this.coords)
        return false;
      if (y === Piece.castledRookFiles[wing])
        break;
    }

    return true;
  }

  public *castlingCoords(): CoordsGenerator {
    for (const wing of [Wing.QUEEN_SIDE, Wing.KING_SIDE]) {
      if (!this.canCastleToWing(wing))
        continue;
      const y = (this.board.position.game.isChess960)
        ? this.board.startRookFiles[wing]
        : King.castledKingFiles[wing];
      yield this.board.Coords.get(this.coords.x, y);
    }
  }
}