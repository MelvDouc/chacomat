import { Pieces } from "@/pieces/Piece.ts";
import { assert, assertEquals, assertFalse } from "@dev_deps";

Deno.test("piece opposite", () => {
  assertEquals(Pieces.BLACK_BISHOP.opposite, Pieces.WHITE_BISHOP);
});

Deno.test("short range", () => {
  assert(Pieces.BLACK_KING.isShortRange());
  assertFalse(Pieces.WHITE_QUEEN.isShortRange());
});