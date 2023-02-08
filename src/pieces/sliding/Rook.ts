import SlidingPiece from "@chacomat/pieces/sliding/SlidingPiece.js";
import { CastlingRights } from "@chacomat/types.local.js";

export default class Rook extends SlidingPiece {
  static override readonly offsets = {
    x: [0, -1, 0, 1],
    y: [-1, 0, 1, 0]
  };

  isOnInitialSquare(castlingRights: CastlingRights): boolean {
    const { x, y } = this.getCoords();
    return x === this.startRank && castlingRights[this.color].includes(y);
  }
}