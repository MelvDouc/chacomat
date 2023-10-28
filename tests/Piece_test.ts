import { Board, Color, coords, Pieces } from "../mod.ts";
import { assert, assertEquals } from "./test.index.ts";

Deno.test("colors", () => {
  for (const key in Pieces) {
    const piece = Pieces[key as keyof typeof Pieces];
    const color = key.startsWith("WHITE") ? Color.WHITE : Color.BLACK;
    assertEquals(piece.color, color);
  }
});

Deno.test("types", () => {
  assert(Pieces.BLACK_BISHOP.isBishop());
  assert(Pieces.WHITE_QUEEN.isQueen());
});

Deno.test("initials", () => {
  assertEquals(Pieces.BLACK_PAWN.whiteInitial, Pieces.WHITE_PAWN.initial);
  assertEquals(Pieces.WHITE_QUEEN.initial, "Q");
  assertEquals(Pieces.BLACK_KNIGHT.initial, "n");
});

Deno.test("opposites", () => {
  assertEquals(Pieces.WHITE_ROOK.opposite, Pieces.BLACK_ROOK);
  assertEquals(Pieces.BLACK_ROOK.opposite, Pieces.WHITE_ROOK);
});

Deno.test("A rook should always attack 14 squares.", () => {
  const board = new Board();
  const x = Math.floor(Math.random() * 8);
  const y = Math.floor(Math.random() * 8);
  board.set(coords[x][y], Pieces.WHITE_ROOK);
  const attackedCoords = Pieces.WHITE_ROOK.getAttackedCoords(board, coords[x][y]);
  assertEquals(attackedCoords.length, 14);
});