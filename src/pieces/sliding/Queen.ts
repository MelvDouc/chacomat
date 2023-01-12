import SlidingPiece from "./SlidingPiece.js";

export default class Queen extends SlidingPiece {
  public static readonly whiteInitial = "Q";
  public static startFiles = [3];
}