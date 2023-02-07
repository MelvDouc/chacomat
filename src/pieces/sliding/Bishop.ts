import { bishopOffsets } from "@chacomat/pieces/offsets.js";
import SlidingPiece from "@chacomat/pieces/sliding/SlidingPiece.js";

export default class Bishop extends SlidingPiece {
  static override readonly whiteInitial = "B";
  static override readonly offsets = bishopOffsets;

  get squareParity(): 0 | 1 {
    const { x, y } = this.getCoords();
    return Number(x % 2 === y % 2) as 0 | 1;
  }
}