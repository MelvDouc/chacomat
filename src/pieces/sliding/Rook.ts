import SlidingPiece from "./SlidingPiece.js";

export default class Rook extends SlidingPiece {
  public static readonly initial = "R";
  public static startFiles = [0, 7];

  public static readonly offsets = {
    x: [0, -1, 1, 0],
    y: [-1, 0, 0, 1]
  };
}