import SlidingPiece from "./SlidingPiece.js";
import Wing from "../../constants/Wing.js";

export default class Rook extends SlidingPiece {
  public static readonly whiteInitial = "R";

  public static readonly offsets = {
    x: [0, -1, 1, 0],
    y: [-1, 0, 0, 1]
  };

  public wing: Wing | null = null;

  public isRook(): this is Rook {
    return true;
  }

  public isOnInitialSquare(): boolean {
    return this.coords.x === Rook.startPieceRanks[this.color]
      && (
        this.coords.y === this.board.getStartRookFiles()[Wing.QUEEN_SIDE]
        || this.coords.y === this.board.getStartRookFiles()[Wing.KING_SIDE]
      );
  }
}