import SlidingPiece from "./SlidingPiece.js";
import { bishopOffsets } from "../../utils/sliding-offsets.js";

export default class Bishop extends SlidingPiece {
  public static override readonly whiteInitial = "B";
  protected static override readonly offsets = bishopOffsets;

}