import Piece from "./_Piece.js";
import type {
  Bishop,
  Board,
  Knight,
  PieceInfo,
  Position,
  Promotable,
  Queen,
  Rook
} from "../types.js";

export default class Pawn extends Piece {
  public static readonly whiteInitial = "P";

  private static pawnXOffsets = {
    WHITE: [-1, -1],
    BLACK: [1, 1]
  };

  private static pawnYOffsets = [-1, 1];

  private *forwardMoves() {
    const coords1 = this.coords.getPeer(Pawn.directions[this.color], 0)!;

    if (!this.board.get(coords1)) {
      yield coords1;

      if (this.coords.x === Piece.startPawnRanks[this.color]) {
        const coords2 = coords1.getPeer(Pawn.directions[this.color], 0)!;

        if (!this.board.get(coords2))
          yield coords2;
      }
    }
  }

  private *captures() {
    for (const destCoords of this.attackedCoords())
      if (
        this.board.get(destCoords)?.color === this.oppositeColor
        || destCoords.y === this.board.position.enPassantFile
        && this.coords.x === Piece.middleRanks[this.oppositeColor]
      )
        yield destCoords;
  }

  public *attackedCoords() {
    for (const xOffset of Pawn.pawnXOffsets[this.color]) {
      for (const yOffset of Pawn.pawnYOffsets) {
        const coords = this.coords.getPeer(xOffset, yOffset);
        if (coords)
          yield coords;
      }
    }
  }

  public *pseudoLegalMoves() {
    yield* this.forwardMoves();
    yield* this.captures();
  }

  public promote(type: Promotable): Queen | Rook | Bishop | Knight {
    return Reflect.construct(Piece.constructors.get(type)!, [{
      color: this.color,
      board: this.board
    } as PieceInfo]);
  }
}