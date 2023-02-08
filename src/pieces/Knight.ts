import Piece from "@chacomat/pieces/Piece.js";

export default class Knight extends Piece {
  static override readonly offsets = {
    x: [-1, -2, -2, -1, 1, 2, 2, 1],
    y: [-2, -1, 1, 2, 2, 1, -1, -2]
  };
}