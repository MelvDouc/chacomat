import SlidingPiece from "@chacomat/pieces/sliding/SlidingPiece.js";

export default class Bishop extends SlidingPiece {
  static override readonly offsets = {
    x: [-1, -1, 1, 1],
    y: [-1, 1, -1, 1]
  };

  get colorComplex(): 0 | 1 {
    return Number(this.x % 2 === this.y % 2) as 0 | 1;
  }
}