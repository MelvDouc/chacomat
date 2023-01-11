import Wing from "../../constants/Wing.js";
import { Coords } from "../../types.js";
import SlidingPiece from "./SlidingPiece.js";

export default class Rook extends SlidingPiece {
  public static readonly initial = "R";

  public static readonly offsets = {
    x: [0, -1, 1, 0],
    y: [-1, 0, 0, 1]
  };

  public isOnInitialSquare({ x, y }: Coords): boolean {
    return x === Rook.initialPieceRanks[this.color]
      && (y === Wing.QUEEN_SIDE || y === Wing.KING_SIDE);
  }
}