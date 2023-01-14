import Piece from "./Piece.js";

export default class Knight extends Piece {
  public static readonly whiteInitial = "N";
  protected static readonly offsets = {
    x: [-2, -2, -1, -1, 1, 1, 2, 2],
    y: [-1, 1, -2, 2, -2, 2, -1, 1]
  };
}