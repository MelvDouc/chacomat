import Piece from "@chacomat/pieces/Piece.js";

export default abstract class SlidingPiece extends Piece {
  override *attackedCoords() {
    for (let i = 0; i < this.offsets.x.length; i++) {
      let { coords: destCoords } = this;

      while ((destCoords = destCoords.getPeer(this.offsets.x[i], this.offsets.y[i])) !== null) {
        yield destCoords;
        if (this.board.has(destCoords))
          break;
      }
    }
  }
}