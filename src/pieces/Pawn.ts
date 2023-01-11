import Piece from "./_Piece.js";
import {
  Bishop,
  Board,
  Coords,
  Knight,
  Position,
  Promotable,
  Queen,
  Rook
} from "../types.js";

export default class Pawn extends Piece {
  public static readonly initial = "P";

  private static pawnXOffsets = {
    WHITE: [-1, -1],
    BLACK: [1, 1]
  };

  private static pawnYOffsets = [-1, 1];

  private *forwardMoves(srcCoords: Coords, board: Board) {
    const coords1 = srcCoords.getPeer({ xOffset: Pawn.directions[this.color], yOffset: 0 })!;

    if (!board.get(coords1)) {
      yield coords1;

      if (srcCoords.x === Piece.initialPawnRanks[this.color]) {
        const coords2 = coords1.getPeer({ xOffset: Pawn.directions[this.color], yOffset: 0 })!;

        if (!board.get(coords2))
          yield coords2;
      }
    }
  }

  private *captures(srcCoords: Coords, board: Board, enPassantFile: number) {
    for (const destCoords of this.attackedCoords(srcCoords, board))
      if (
        board.get(destCoords)?.color === this.oppositeColor
        || destCoords.y === enPassantFile && srcCoords.x === Piece.middleRanks[this.oppositeColor]
      )
        yield destCoords;
  }

  public *attackedCoords(srcCoords: Coords, _board: Board) {
    for (const xOffset of Pawn.pawnXOffsets[this.color]) {
      for (const yOffset of Pawn.pawnYOffsets) {
        const coords = srcCoords.getPeer({ xOffset, yOffset });
        if (coords)
          yield coords;
      }
    }
  }

  public *pseudoLegalMoves(srcCoords: Coords, { board, enPassantFile }: Position) {
    yield* this.forwardMoves(srcCoords, board);
    yield* this.captures(srcCoords, board, enPassantFile);
  }

  public promote(type: Promotable): Queen | Rook | Bishop | Knight {
    return Reflect.construct(Piece.constructors.get(type)!, [this.color]);
  }
}