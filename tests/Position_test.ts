import { assert, assertEquals, assertFalse } from "$dev_deps";
import ChessGame from "@/international/ChessGame.ts";
import Position from "@/international/Position.ts";

Deno.test("legal moves #1", () => {
  const { board, legalMoves } = Position.new();

  assertEquals(legalMoves.filter((move) => board.getByCoords(move.srcCoords)?.isPawn()).length, 16);
  assertEquals(legalMoves.filter((move) => board.getByCoords(move.srcCoords)?.isKnight()).length, 4);
});

Deno.test("Insufficient material: only kings", () => {
  assert(Position.fromFen("k1K5/8/8/8/8/8/8/8 w - - 0 1").isInsufficientMaterial());
});

Deno.test("Insufficient material: minor vs nothing", () => {
  assert(Position.fromFen("k1K5/n7/8/8/8/8/8/8 w - - 0 1").isInsufficientMaterial());
});

Deno.test("Insufficient material: same-colored bishops", () => {
  assert(Position.fromFen("k1K5/b1B5/8/8/8/8/8/8 w - - 0 1").isInsufficientMaterial());
});

Deno.test("Sufficient material: opposite-colored bishops", () => {
  assertFalse(Position.fromFen("k1K5/bB6/8/8/8/8/8/8 w - - 0 1").isInsufficientMaterial());
});

Deno.test("Stalemate #1", () => {
  assert(Position.fromFen("5bnr/4p1pq/4Qpkr/7p/7P/4P3/PPPP1PP1/RNB1KBNR b KQ - 2 10").isStalemate());
});

Deno.test("Stalemate #2", () => {
  assert(Position.fromFen("rn2k1nr/pp4pp/3p4/q1pP4/P1P2p1b/1b2pPRP/1P1NP1PQ/2B1KBNR w Kkq - 0 13").isStalemate());
});

Deno.test("Triple repetition #1", () => {
  const game = new ChessGame({ pgn: `1.Nf3 Nf6 2.Ng1 Ng8 3.Nf3 Nf6 4.Ng1 Ng8 5.Nf3 *` });
  assert(game.currentPosition.isTripleRepetition());
});

Deno.test("Triple repetition #2", () => {
  const game = new ChessGame({ pgn: `1.Nf3 Nf6 2.Ng1 Ng8 3.Nf3 Nf6 4.Ng1 Ng8 6.Nc3 Nc6 7.Nb1 Nb8 8.Nf3 *` });
  assert(game.currentPosition.isTripleRepetition());
});