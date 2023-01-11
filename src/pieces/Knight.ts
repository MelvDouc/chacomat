import Piece from "./_Piece.js";

export default class Knight extends Piece {
  public static readonly initial = "N";
  public static startFiles = [1, 6];

  public static readonly offsets = {
    x: [-2, -2, -1, -1, 1, 1, 2, 2],
    y: [-1, 1, -2, 2, -2, 2, -1, 1]
  };
}