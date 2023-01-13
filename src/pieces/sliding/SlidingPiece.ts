import Piece from "../_Piece.js";

export default abstract class SlidingPiece extends Piece {
  public *attackedCoords() {
    const { x: xOffsets, y: yOffsets } = (this.constructor as typeof Piece).offsets;

    for (let i = 0; i < xOffsets.length; i++) {
      let coords = this.coords.getPeer(xOffsets[i], yOffsets[i]);
      while (coords) {
        yield coords;
        if (this.board.has(coords))
          break;
        coords = coords.getPeer(xOffsets[i], yOffsets[i]);
      }
    }
  }
}