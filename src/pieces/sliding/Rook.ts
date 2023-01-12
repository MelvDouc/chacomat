import SlidingPiece from "./SlidingPiece.js";
import Wing from "../../constants/Wing.js";
import type { Coords } from "../../types.js";

export default class Rook extends SlidingPiece {
  public static readonly whiteInitial = "R";

  public static readonly offsets = {
    x: [0, -1, 1, 0],
    y: [-1, 0, 0, 1]
  };

  public isOnInitialSquare({ x, y }: Coords): boolean {
    return x === Rook.startPieceRanks[this.color]
      && (
        y === Rook.startRookFiles[Wing.QUEEN_SIDE]
        || y === Rook.startRookFiles[Wing.KING_SIDE]
      );
  }
}