import SlidingPiece from "./SlidingPiece.js";
import { bishopOffsets } from "../../utils/sliding-offsets.js";

export default class Bishop extends SlidingPiece {
  public static readonly whiteInitial = "B";
  public static readonly offsets = bishopOffsets;

}