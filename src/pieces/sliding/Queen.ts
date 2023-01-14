import SlidingPiece from "./SlidingPiece.js";
import { adjacentOffsets } from "../../utils/sliding-offsets.js";

export default class Queen extends SlidingPiece {
  public static override readonly whiteInitial = "Q";
  protected static override readonly offsets = adjacentOffsets;
}