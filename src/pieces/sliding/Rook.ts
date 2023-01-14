import SlidingPiece from "./SlidingPiece.js";
import { Wing } from "../../utils/constants.js";
import { rookOffsets } from "../../utils/sliding-offsets.js";

export default class Rook extends SlidingPiece {
  public static override readonly whiteInitial = "R";
  protected static override readonly offsets = rookOffsets;

  public get wing(): Wing {
    return (this.coords.y === this.board.startRookFiles[Wing.QUEEN_SIDE])
      ? Wing.QUEEN_SIDE
      : Wing.KING_SIDE;
  }

  public isOnInitialSquare(): boolean {
    return this.coords.x === Rook.startPieceRanks[this.color]
      && (
        this.coords.y === this.board.startRookFiles[Wing.QUEEN_SIDE]
        || this.coords.y === this.board.startRookFiles[Wing.KING_SIDE]
      );
  }
}