import SlidingPiece from "./SlidingPiece.js";

export default class Queen extends SlidingPiece {
  public static readonly initial = "Q";
  public static startFiles = [3];
}