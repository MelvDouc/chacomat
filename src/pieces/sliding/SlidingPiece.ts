import Piece from "@chacomat/pieces/Piece.js";
import { coordsToIndex, isSafe } from "@chacomat/utils/Index.js";

export default abstract class SlidingPiece extends Piece {
  override *attackedIndices() {
    const { x, y } = this.getCoords();

    for (let i = 0; i < this.offsets.x.length; i++) {
      let x2 = x,
        y2 = y;

      while (isSafe(x2 += this.offsets.x[i]) && isSafe(y2 += this.offsets.y[i])) {
        const index = coordsToIndex(x2, y2);
        yield index;
        if (this.getBoard().has(index)) break;
      }
    }
  }
}