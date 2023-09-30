import Position from "@/variants/standard/Position.ts";
import { assertArrayIncludes, assertEquals } from "@dev_deps";

Deno.test("legal moves", () => {
  const { board, legalMoves } = Position.new();

  assertEquals(legalMoves.filter(({ srcIndex }) => board.get(srcIndex)?.isPawn()).length, 16);
  assertEquals(legalMoves.filter(({ srcIndex }) => board.get(srcIndex)?.isKnight()).length, 4);
});

Deno.test("ambiguous move notation #1", () => {
  const { legalMovesAsAlgebraicNotation } = Position.fromFen("3Q4/8/8/Q2Q4/8/8/8/4K1k1 w - - 0 1");
  assertArrayIncludes(legalMovesAsAlgebraicNotation, ["Q8a8", "Qaa8", "Qd5a8"]);
});

Deno.test("ambiguous move notation #2", () => {
  const { legalMovesAsAlgebraicNotation } = Position.fromFen("8/1QQQ4/1Q1Q4/1QQQ4/8/5K2/8/7k w - - 0 1");
  const moves = ["Qb7c6", "Qc7c6", "Qd7c6", "Qb6c6", "Qd6c6", "Qb5c6", "Qc5c6", "Qd5c6"];
  assertArrayIncludes(legalMovesAsAlgebraicNotation, moves);
});

Deno.test("ambiguous move notation #3", () => {
  const { legalMovesAsAlgebraicNotation } = Position.fromFen("8/1Q6/1Q4Q1/2QQ4/Q7/5K2/8/7k w - - 0 1");
  const moves = ["Qac6", "Q7c6", "Qb6c6", "Qcc6", "Qdc6", "Qgc6"];
  assertArrayIncludes(legalMovesAsAlgebraicNotation, moves);
});