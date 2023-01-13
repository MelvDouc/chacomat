import SlidingPiece from "./SlidingPiece.js";

export default class Queen extends SlidingPiece {
  public static readonly whiteInitial = "Q";

  public isQueen(): this is Queen {
    return true;
  }
}