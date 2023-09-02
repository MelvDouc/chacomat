import Coords from "@constants/Coords.js";
import Piece from "@constants/Piece.js";
import Chess960Position from "@variants/chess960/Chess960Position.js";
import { strict, strictEqual } from "node:assert";
import { describe, it } from "node:test";

describe("position", () => {
  it("piece count", () => {
    const position = Chess960Position.random();
    const whitePieceRank = Array.from({ length: 8 }, (_, y) => {
      return position.board.get(Coords.get(7, y))!;
    });
    const count = whitePieceRank.reduce((acc, piece) => {
      return acc.set(piece, (acc.get(piece) ?? 0) + 1);
    }, new Map<Piece, number>());

    strictEqual(count.get(Piece.WHITE_KING), 1);
    strictEqual(count.get(Piece.WHITE_QUEEN), 1);
    strictEqual(count.get(Piece.WHITE_ROOK), 2);
    strictEqual(count.get(Piece.WHITE_BISHOP), 2);
    strictEqual(count.get(Piece.WHITE_KNIGHT), 2);
  });

  it("pieces should match", () => {
    const position = Chess960Position.random();
    const whitePieceRank = Array.from({ length: 8 }, (_, y) => {
      return position.board.get(Coords.get(7, y))!;
    });
    const test = whitePieceRank.every((piece, y) => position.board.get(Coords.get(0, y)) === piece.opposite);
    strict(test, position.toString());
  });
});