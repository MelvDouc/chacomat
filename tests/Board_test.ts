import { assert, assertEquals, assertFalse } from "$dev_deps";
import Board from "@/impl/Board.ts";
import Color from "@/impl/Color.ts";
import Piece from "@/impl/Piece.ts";

const { Pieces } = Piece;

Deno.test("king coords", () => {
  const board = new Board();
  board.set(0, 0, Pieces.WHITE_KING);

  assertEquals(board.getKingCoords(Color.WHITE), board.Coords(0, 0));
});

Deno.test("pieces of color", () => {
  const board = new Board();
  board.set(0, 0, Pieces.BLACK_KING);
  board.set(0, 1, Pieces.BLACK_ROOK);
  board.set(0, 2, Pieces.WHITE_KING);
  board.set(0, 3, Pieces.BLACK_QUEEN);

  assert([...board.getPiecesOfColor(Color.BLACK)].every(([, piece]) => piece.color === Color.BLACK));
});

Deno.test("castling possible", () => {
  const board = new Board();
  board.set(7, 0, Pieces.WHITE_ROOK);
  board.set(7, 4, Pieces.WHITE_KING);
  board.set(7, 6, Pieces.WHITE_KNIGHT);
  board.set(7, 7, Pieces.WHITE_ROOK);

  assert(board.canCastle(0, Color.WHITE, new Set()));
});

Deno.test("castling obstructed", () => {
  const board = new Board();
  board.set(7, 0, Pieces.WHITE_ROOK);
  board.set(7, 4, Pieces.WHITE_KING);
  board.set(7, 6, Pieces.WHITE_KNIGHT);
  board.set(7, 7, Pieces.WHITE_ROOK);

  assertFalse(board.canCastle(7, Color.WHITE, new Set()));
});

Deno.test("castling through check", () => {
  const board = new Board();
  board.set(7, 0, Pieces.WHITE_ROOK);
  board.set(7, 4, Pieces.WHITE_KING);
  board.set(7, 7, Pieces.WHITE_ROOK);
  const attackedCoordsSet = new Set([board.Coords(7, 6)]);

  assertFalse(board.canCastle(7, Color.WHITE, attackedCoordsSet));
});

Deno.test("clone", () => {
  const board = new Board();
  board.set(7, 0, Pieces.WHITE_ROOK);
  board.set(7, 4, Pieces.WHITE_KING);
  board.set(7, 7, Pieces.WHITE_ROOK);

  assertEquals(board.toString(), board.clone().toString());
});

Deno.test("stringify", () => {
  const boardStr = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
  const board = Board.fromString(boardStr);
  assertEquals(board.toString(), boardStr, `${boardStr} -> ${board.toString()}`);
});