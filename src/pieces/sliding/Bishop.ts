import SlidingPiece from "./SlidingPiece.js";

export default class Bishop extends SlidingPiece {
  public static readonly initial = "B";

  public static readonly offsets = {
    x: [-1, -1, 1, 1],
    y: [-1, 1, -1, 1]
  };
}