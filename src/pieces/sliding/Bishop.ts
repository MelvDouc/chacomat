import SlidingPiece from "./SlidingPiece.js";

export default class Bishop extends SlidingPiece {
  public static readonly whiteInitial = "B";

  public static readonly offsets = {
    x: [-1, -1, 1, 1],
    y: [-1, 1, -1, 1]
  };

  public isBishop(): this is Bishop {
    return true;
  }
}