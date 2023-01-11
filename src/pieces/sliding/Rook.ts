import Wing from "../../constants/Wing.js";
import { Coords } from "../../types.js";
import Piece from "../_Piece.js";
import SlidingPiece from "./SlidingPiece.js";

export default class Rook extends SlidingPiece {
  public static readonly initial = "R";

  public static readonly offsets = {
    x: [0, -1, 1, 0],
    y: [-1, 0, 0, 1]
  };

  public isOnInitialSquare({ x, y }: Coords): boolean {
    return x === (this.constructor as typeof Piece).INITIAL_PIECE_RANKS[this.color]
      && (y === Wing.QUEEN_SIDE || y === Wing.KING_SIDE);
  }
}