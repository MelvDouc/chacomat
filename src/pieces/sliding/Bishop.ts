import SlidingPiece from "@chacomat/pieces/sliding/SlidingPiece.js";
import { bishopOffsets } from "@chacomat/utils/sliding-offsets.js";

export default class Bishop extends SlidingPiece {
  public static override readonly WHITE_INITIAL = SlidingPiece.WHITE_PIECE_INITIALS.BISHOP;
  protected static override readonly OFFSETS = bishopOffsets;

  /**
   * 0 means this is a light-squared bishop.
   * Used in determining if a position is a draw by insufficient material.
   */
  public get squareParity(): 0 | 1 {
    return (this.coords.x % 2 === this.coords.y % 2)
      ? 0
      : 1;
  }
}