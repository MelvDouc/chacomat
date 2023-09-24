import ShatranjPiece from "@/variants/shatranj/ShatranjPiece.ts";
import Piece from "@/variants/standard/Piece.ts";
import { assert, assertEquals, assertFalse } from "@dev_deps";

Deno.test("piece opposite", () => {
  assertEquals(ShatranjPiece.Pieces.BLACK_BISHOP.opposite, ShatranjPiece.Pieces.WHITE_BISHOP);
});

Deno.test("short range", () => {
  assert(ShatranjPiece.Pieces.BLACK_KING.isShortRange());
  assert(ShatranjPiece.Pieces.WHITE_QUEEN.isShortRange());
  assertFalse(Piece.Pieces.WHITE_QUEEN.isShortRange());
});