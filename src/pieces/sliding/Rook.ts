import SlidingPiece from "./SlidingPiece.js";
import Wing from "../../constants/Wing.js";
import type { Board } from "../../types.js";

export default class Rook extends SlidingPiece {
  public static readonly whiteInitial = "R";

  public static readonly offsets = {
    x: [0, -1, 1, 0],
    y: [-1, 0, 0, 1]
  };

  public isOnInitialSquare(board: Board): boolean {
    return this.coords.x === Rook.startPieceRanks[this.color]
      && (
        this.coords.y === board.startRookFiles[Wing.QUEEN_SIDE]
        || this.coords.y === board.startRookFiles[Wing.KING_SIDE]
      );
  }
}