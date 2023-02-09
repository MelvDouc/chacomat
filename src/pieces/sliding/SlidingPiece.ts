import Piece from "@chacomat/pieces/Piece.js";
import { isSafe } from "@chacomat/utils/Index.js";

export default abstract class SlidingPiece extends Piece {
  override *attackedCoords() {
    for (let i = 0; i < this.offsets.x.length; i++) {
      const destCoords = this.coords;

      while (isSafe(destCoords.x += this.offsets.x[i]) && isSafe(destCoords.y += this.offsets.y[i])) {
        yield { ...destCoords };
        if (this.board.has(destCoords)) break;
      }
    }
  }
}