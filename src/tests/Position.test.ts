import Position from "@game/Position.js";
import { count } from "@tests/utils.js";
import { strictEqual } from "node:assert";
import { test } from "node:test";

test("legal moves #1", () => {
  const { board, legalMoves } = Position.fromFen(Position.START_FEN);

  strictEqual(count(legalMoves, (move) => !!board.get(move.srcCoords)?.isPawn()), 16);
  strictEqual(count(legalMoves, (move) => !!board.get(move.srcCoords)?.isKnight()), 4);
});