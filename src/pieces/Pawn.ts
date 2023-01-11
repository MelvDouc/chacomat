import Piece from "./_Piece.js";
import Color from "../constants/Color.js";
import { Board, Coords, Position, Promotable } from "../types.js";

export default class Pawn extends Piece {
  public static readonly initial = "P";

  private static pawnXOffsets = {
    [Color.WHITE]: [-Color.WHITE, -Color.WHITE],
    [Color.BLACK]: [-Color.BLACK, -Color.BLACK]
  };

  private static pawnYOffsets = [-1, 1];

  private *forwardMoves(srcCoords: Coords, board: Board) {
    const coords1 = {
      x: srcCoords.x - this.color,
      y: srcCoords.y
    };

    if (!board.get(coords1)) {
      yield coords1;

      if (srcCoords.x === Piece.initialPawnRanks[this.color]) {
        const coords2 = {
          x: coords1.x - this.color,
          y: coords1.y
        };

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
      const x = srcCoords.x + xOffset;
      if (x >= 0 && x < 8)
        for (const yOffset of Pawn.pawnYOffsets) {
          const y = srcCoords.y + yOffset;
          if (y >= 0 && y < 8)
            yield { x, y };
        }
    }
  }

  public *pseudoLegalMoves(srcCoords: Coords, { board, enPassantFile }: Position) {
    yield* this.forwardMoves(srcCoords, board);
    yield* this.captures(srcCoords, board, enPassantFile);
  }

  public promote(type: Promotable): Piece {
    return Reflect.construct(Piece.constructors.get(type)!, [this.color]);
  }
}