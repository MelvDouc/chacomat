import SlidingPiece from "./SlidingPiece.js";
import { Wing } from "../../utils/constants.js";

export default class Rook extends SlidingPiece {
  public static readonly whiteInitial = "R";

  public static readonly offsets = {
    x: [0, -1, 1, 0],
    y: [-1, 0, 0, 1]
  };

  public get wing(): Wing {
    return (this.coords.y === this.board.startRookFiles[Wing.QUEEN_SIDE])
      ? Wing.QUEEN_SIDE
      : Wing.KING_SIDE;
  }

  public isRook(): this is Rook {
    return true;
  }

  public isOnInitialSquare(): boolean {
    return this.coords.x === Rook.startPieceRanks[this.color]
      && (
        this.coords.y === this.board.startRookFiles[Wing.QUEEN_SIDE]
        || this.coords.y === this.board.startRookFiles[Wing.KING_SIDE]
      );
  }
}