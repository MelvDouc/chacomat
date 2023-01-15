import SlidingPiece from "@pieces/sliding/SlidingPiece.js";
import { bishopOffsets } from "@utils/sliding-offsets.js";

export default class Bishop extends SlidingPiece {
  public static override readonly WHITE_INITIAL = SlidingPiece.WHITE_PIECE_INITIALS.BISHOP;
  protected static override readonly OFFSETS = bishopOffsets;

}