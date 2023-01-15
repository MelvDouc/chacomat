import SlidingPiece from "@chacomat/pieces/sliding/SlidingPiece.js";
import { adjacentOffsets } from "@chacomat/utils/sliding-offsets.js";

export default class Queen extends SlidingPiece {
  public static override readonly WHITE_INITIAL = this.WHITE_PIECE_INITIALS.QUEEN;
  protected static override readonly OFFSETS = adjacentOffsets;
}