import { rookOffsets } from "@chacomat/pieces/offsets.js";
import SlidingPiece from "@chacomat/pieces/sliding/SlidingPiece.js";
import { CastlingRights } from "@chacomat/types.local.js";

export default class Rook extends SlidingPiece {
  static override readonly whiteInitial = "R";
  static override readonly offsets = rookOffsets;

  isOnInitialSquare(castlingRights: CastlingRights): boolean {
    const { x, y } = this.getCoords();
    return x === this.startRank && castlingRights[this.color].includes(y);
  }
}