import Piece from "@chacomat/pieces/Piece.js";
import { CoordsGenerator } from "@chacomat/types.js";

export default abstract class SlidingPiece extends Piece {
  public override *attackedCoords(): CoordsGenerator {
    const { x: xOffsets, y: yOffsets } = (this.constructor as typeof Piece).OFFSETS;

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