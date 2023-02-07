import { adjacentOffsets } from "@chacomat/pieces/offsets.js";
import SlidingPiece from "@chacomat/pieces/sliding/SlidingPiece.js";

export default class Queen extends SlidingPiece {
  static override readonly whiteInitial = "Q";
  static override readonly offsets = adjacentOffsets;
}