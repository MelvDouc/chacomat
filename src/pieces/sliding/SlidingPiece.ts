import Coords from "../../constants/Coords.js";
import { Board } from "../../types.js";
import Piece from "../_Piece.js";

export default abstract class SlidingPiece extends Piece {
  public *attackedCoords(srcCoords: Coords, board: Board) {
    const { x: xOffsets, y: yOffsets } = (this.constructor as typeof Piece).offsets;

    for (let i = 0; i < xOffsets.length; i++) {
      let coords = Coords.get(srcCoords.x + xOffsets[i], srcCoords.y + yOffsets[i]);
      while (coords) {
        yield coords;
        if (board.get(coords))
          break;
        coords = coords.getPeer({ xOffset: xOffsets[i], yOffset: yOffsets[i] });
      }
    }
  }
}