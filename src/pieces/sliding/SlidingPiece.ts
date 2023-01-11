import { Board, Coords } from "../../types.js";
import Piece from "../_Piece.js";

export default abstract class SlidingPiece extends Piece {
  public *attackedCoords(srcCoords: Coords, board: Board) {
    const { x: xOffsets, y: yOffsets } = (this.constructor as typeof Piece).offsets;

    for (let i = 0; i < xOffsets.length; i++) {
      let x = srcCoords.x + xOffsets[i],
        y = srcCoords.y + yOffsets[i];
      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        yield { x, y };
        if (board.get({ x, y })) break;
        x += xOffsets[i];
        y += yOffsets[i];
      }
    }
  }
}