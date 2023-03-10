import Piece from "@chacomat/pieces/Piece.js";
import type Board from "@chacomat/game/Board.js";

export default abstract class SlidingPiece extends Piece {
  override *attackedCoords(board: Board) {
    for (let i = 0; i < this.offsets.x.length; i++) {
      let { coords: destCoords } = this;

      while ((destCoords = destCoords.getPeer(this.offsets.x[i], this.offsets.y[i])) !== null) {
        yield destCoords;
        if (board.has(destCoords))
          break;
      }
    }
  }
}