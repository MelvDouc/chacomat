import SlidingPiece from "./SlidingPiece.js";
import { adjacentOffsets } from "../../utils/sliding-offsets.js";

export default class Queen extends SlidingPiece {
  public static readonly whiteInitial = "Q";
  protected static readonly offsets = adjacentOffsets;
}