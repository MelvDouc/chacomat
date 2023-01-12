import Piece from "../_Piece.js";
import type { Board, Coords } from "../../types.js";

export default abstract class SlidingPiece extends Piece {
  public *attackedCoords(board: Board) {
    const { x: xOffsets, y: yOffsets } = (this.constructor as typeof Piece).offsets;

    for (let i = 0; i < xOffsets.length; i++) {
      let coords = this.coords.getPeer(xOffsets[i], yOffsets[i]);
      while (coords) {
        yield coords;
        if (board.get(coords))
          break;
        coords = coords.getPeer(xOffsets[i], yOffsets[i]);
      }
    }
  }
}