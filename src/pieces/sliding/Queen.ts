import Bishop from "./Bishop.js";
import Rook from "./Rook.js";
import SlidingPiece from "./SlidingPiece.js";

export default class Queen extends SlidingPiece {
  public static readonly initial = "Q";

  public static readonly offsets = {
    x: Rook.offsets.x.concat(Bishop.offsets.x),
    y: Rook.offsets.y.concat(Bishop.offsets.y)
  };
}