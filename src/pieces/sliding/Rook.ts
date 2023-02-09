import SlidingPiece from "@chacomat/pieces/sliding/SlidingPiece.js";

export default class Rook extends SlidingPiece {
  static override readonly offsets = {
    x: [0, -1, 0, 1],
    y: [-1, 0, 1, 0]
  };
}