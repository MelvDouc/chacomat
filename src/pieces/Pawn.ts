import Piece from "@chacomat/pieces/Piece.js";
import { IndexGenerator } from "../types.local.js";
import { coordsToIndex } from "../utils/Index.js";

export default class Knight extends Piece {
  static override readonly whiteInitial = "P";
  static override readonly offsets = {
    x: [1, 1],
    y: [-1, 1]
  };
  static override readonly START_RANKS = {
    "WHITE": 6,
    "BLACK": 1
  };

  *#forwardMoves(): IndexGenerator {
    const { x, y } = this.getCoords();
    const index1 = coordsToIndex(x + this.direction, y);

    if (!this.getBoard().has(index1)) {
      yield index1;

      if (x === this.startRank) {
        const index2 = coordsToIndex(x + this.direction * 2, y);

        if (!this.getBoard().has(index2))
          yield index2;
      }
    }
  }

  *#captures(): IndexGenerator {
    for (const destIndex of this.attackedIndices())
      if (
        this.getBoard().get(destIndex)?.color === this.oppositeColor
        || destIndex === this.getBoard().getEnPassantIndex()
      )
        yield destIndex;
  }

  override *pseudoLegalMoves(): IndexGenerator {
    yield* this.#forwardMoves();
    yield* this.#captures();
  }
}