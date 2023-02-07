import SlidingPiece from "@chacomat/pieces/sliding/SlidingPiece.js";

export default class Queen extends SlidingPiece {
  static override readonly whiteInitial = "Q";
  static override readonly offsets = {
    x: [0, -1, -1, -1, 0, 1, 1, 1],
    y: [-1, -1, 0, 1, 1, -1, 0, 1]
  };
}