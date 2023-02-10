import Piece from "@chacomat/pieces/Piece.js";
import { Coords, CoordsGenerator } from "@chacomat/types.local.js";

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
      const attackedCoords = this.coords.getPeer(
        this.offsets.x[i] * this.direction,
        this.offsets.y[i]
      );
      if (attackedCoords)
        yield attackedCoords;
    }
  }

  *#forwardMoves(): CoordsGenerator {
    const coords1 = this.coords.getPeer(this.direction, 0);

    if (!this.board.has(coords1)) {
      yield coords1;

      if (this.isOnStartRank()) {
        const coords2 = coords1.getPeer(this.direction, 0);

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