import SlidingPiece from "@pieces/sliding/SlidingPiece.js";
import { Wing } from "@utils/constants.js";
import { rookOffsets } from "@utils/sliding-offsets.js";
import { Wings } from "../../types.js";

export default class Rook extends SlidingPiece {
  public static override readonly WHITE_INITIAL = SlidingPiece.WHITE_PIECE_INITIALS.ROOK;
  protected static override readonly OFFSETS = rookOffsets;
  public static readonly initialFiles: Wings<number> = {
    [Wing.QUEEN_SIDE]: 0,
    [Wing.KING_SIDE]: 7
  };

  public isOnInitialSquare(): boolean {
    return this.coords.x === Rook.START_PIECE_RANKS[this.color]
      && (
        this.coords.y === Rook.initialFiles[Wing.QUEEN_SIDE]
        || this.coords.y === Rook.initialFiles[Wing.KING_SIDE]
      );
  }
}