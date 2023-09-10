import ChessGame from "@/standard/ChessGame.ts";
import Position from "@/standard/Position.ts";
import { assert, assertArrayIncludes, assertEquals, assertFalse } from "@dev_deps";

Deno.test("checkmate", () => {
  const pos = Position.fromFen("rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w kqKQ - 1 3");
  assert(pos.isCheckmate());
});

Deno.test("stalemate", () => {
  const pos = Position.fromFen("k7/8/2NN4/8/2K5/8/8/8 b - - 1 1");
  assert(pos.isStalemate());
});

Deno.test("legal moves", () => {
  const { board, legalMoves } = Position.new();

  assertEquals(legalMoves.filter(({ srcIndex }) => board.get(srcIndex)?.isPawn()).length, 16);
  assertEquals(legalMoves.filter(({ srcIndex }) => board.get(srcIndex)?.isKnight()).length, 4);
});

Deno.test("triple repetition", () => {
  const game = new ChessGame({ pgn: "1.Nf3 Nf6 2.Ng1 Ng8 3.Nf3 Nf6 4.Ng1 Ng8 5.Nf3 *" });
  assert(game.currentPosition.isTripleRepetition());
});

Deno.test("insufficient material - kings only", () => {
  const pos = Position.fromFen("k1K/8/8/8/8/8/8/8 w - - 0 1");
  assert(pos.isInsufficientMaterial());
});

Deno.test("insufficient material - same-colored bishops", () => {
  const pos = Position.fromFen("kb4KB/8/8/8/8/8/8/8 w - - 0 1");
  assert(pos.isInsufficientMaterial());
});

Deno.test("sufficient material - opposite-colored bishops", () => {
  const pos = Position.fromFen("kb4BK/8/8/8/8/8/8/8 w - - 0 1");
  assertFalse(pos.isInsufficientMaterial());
});

Deno.test("sufficient material - N vs B", () => {
  const pos = Position.fromFen("kb4NK/8/8/8/8/8/8/8 w - - 0 1");
  assertFalse(pos.isInsufficientMaterial());
});

Deno.test("ambiguous move notation", () => {
  const { legalMovesAsAlgebraicNotation } = Position.fromFen("3Q4/8/8/Q2Q4/8/8/8/4K1k1 w - - 0 1");
  assertArrayIncludes(legalMovesAsAlgebraicNotation.filter(n => n.endsWith("a8")), ["Q8a8", "Qaa8", "Qd5a8"]);
});