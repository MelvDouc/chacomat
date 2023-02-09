import Piece from "@chacomat/pieces/Piece.js";
import { Coords, CoordsGenerator } from "@chacomat/types.local.js";
import { isSafe } from "@chacomat/utils/Index.js";

export default class Pawn extends Piece {
  static override readonly offsets = {
    x: [1, 1],
    y: [-1, 1]
  };
  static override readonly START_RANKS = {
    WHITE: 6,
    BLACK: 1
  };

  override *attackedCoords(): CoordsGenerator {
    for (let i = 0; i < this.offsets.x.length; i++) {
      const x = this.x + this.offsets.x[i] * this.direction,
        y = this.y + this.offsets.y[i];
      if (isSafe(x) && isSafe(y))
        yield { x, y };
    }
  }

  *#forwardMoves(): CoordsGenerator {
    const coords1 = {
      x: this.x + this.direction,
      y: this.y
    };

    if (!this.board.has(coords1)) {
      yield coords1;

      if (this.x === this.startRank) {
        const coords2 = {
          x: coords1.x + this.direction,
          y: coords1.y
        };

        if (!this.board.has(coords2))
          yield coords2;
      }
    }
  }

  *#captures(): CoordsGenerator {
    for (const destCoords of this.attackedCoords())
      if (
        this.board.get(destCoords)?.color === this.oppositeColor
        || this.isEnPassantCapture(destCoords)
      )
        yield destCoords;
  }

  override *pseudoLegalMoves(): CoordsGenerator {
    yield* this.#forwardMoves();
    yield* this.#captures();
  }

  isEnPassantCapture(destCoords: Coords) {
    return this.x === Piece.MIDDLE_RANKS[this.oppositeColor]
      && destCoords.y === this.board.enPassantY;
  }
}