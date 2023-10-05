import Position from "@/game/Position.ts";
import { assertArrayIncludes, assertEquals } from "@dev_deps";

Deno.test("legal moves", () => {
  const { board, legalMoves } = Position.fromFEN(Position.START_FEN);

  assertEquals(legalMoves.filter(({ srcCoords }) => board.get(srcCoords)?.isPawn()).length, 16);
  assertEquals(legalMoves.filter(({ srcCoords }) => board.get(srcCoords)?.isKnight()).length, 4);
});

Deno.test("promotion notation", () => {
  const { legalMovesAsAlgebraicNotation } = Position.fromFEN("8/8/4K3/8/b1n5/7Q/2p5/1k6 b - - 5 313");
  assertArrayIncludes(
    legalMovesAsAlgebraicNotation,
    ["c1=Q"]
  );
});

Deno.test("ambiguous move notation #1", () => {
  const { legalMovesAsAlgebraicNotation } = Position.fromFEN("3Q4/8/8/Q2Q4/8/8/8/4K1k1 w - - 0 1");
  assertArrayIncludes(legalMovesAsAlgebraicNotation, ["Q8a8", "Qaa8", "Qd5a8"]);
});

Deno.test("ambiguous move notation #2", () => {
  const { legalMovesAsAlgebraicNotation } = Position.fromFEN("8/1QQQ4/1Q1Q4/1QQQ4/8/5K2/8/7k w - - 0 1");
  const moves = ["Qb7c6", "Qc7c6", "Qd7c6", "Qb6c6", "Qd6c6", "Qb5c6", "Qc5c6", "Qd5c6"];
  assertArrayIncludes(legalMovesAsAlgebraicNotation, moves);
});

Deno.test("ambiguous move notation #3", () => {
  const { legalMovesAsAlgebraicNotation } = Position.fromFEN("8/1Q6/1Q4Q1/2QQ4/Q7/5K2/8/7k w - - 0 1");
  const moves = ["Qac6", "Q7c6", "Qb6c6", "Qcc6", "Qdc6", "Qgc6"];
  assertArrayIncludes(legalMovesAsAlgebraicNotation, moves);
});