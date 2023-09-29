import Position from "@/variants/standard/Position.ts";
import { assertArrayIncludes, assertEquals } from "@dev_deps";

Deno.test("legal moves", () => {
  const { board, legalMoves } = Position.new();

  assertEquals(legalMoves.filter(({ srcCoords }) => board.get(srcCoords)?.isPawn()).length, 16);
  assertEquals(legalMoves.filter(({ srcCoords }) => board.get(srcCoords)?.isKnight()).length, 4);
});

Deno.test("ambiguous move notation", () => {
  const { legalMovesAsAlgebraicNotation } = Position.fromFen("3Q4/8/8/Q2Q4/8/8/8/4K1k1 w - - 0 1");
  assertArrayIncludes(legalMovesAsAlgebraicNotation, ["Q8a8", "Qaa8", "Qd5a8"]);
});