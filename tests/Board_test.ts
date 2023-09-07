import { assert, assertArrayIncludes, assertEquals, assertFalse } from "$dev_deps";
import Color from "@/constants/Color.ts";
import Coords from "@/constants/Coords.ts";
import Pieces from "@/constants/Pieces.ts";
import Board from "@/game/Board.ts";

Deno.test("king coords", () => {
  const board = new Board();
  board.set(Coords.get(0, 0), Pieces.WHITE_KING);

  assertEquals(board.getKingCoords(Color.WHITE), Coords.get(0, 0));
});

Deno.test("pieces of color", () => {
  const board = new Board();
  board.set(Coords.get(0, 0), Pieces.BLACK_KING);
  board.set(Coords.get(0, 1), Pieces.BLACK_ROOK);
  board.set(Coords.get(0, 2), Pieces.WHITE_KING);
  board.set(Coords.get(0, 3), Pieces.BLACK_QUEEN);

  assert([...board.getPiecesOfColor(Color.BLACK)].every(([, piece]) => piece.color === Color.BLACK));
});

Deno.test("castling possible", () => {
  const board = new Board();
  board.set(Coords.get(7, 0), Pieces.WHITE_ROOK);
  board.set(Coords.get(7, 4), Pieces.WHITE_KING);
  board.set(Coords.get(7, 6), Pieces.WHITE_KNIGHT);
  board.set(Coords.get(7, 7), Pieces.WHITE_ROOK);

  assert(board.canCastle(0, Color.WHITE, new Set()));
});

Deno.test("castling obstructed", () => {
  const board = new Board();
  board.set(Coords.get(7, 0), Pieces.WHITE_ROOK);
  board.set(Coords.get(7, 4), Pieces.WHITE_KING);
  board.set(Coords.get(7, 6), Pieces.WHITE_KNIGHT);
  board.set(Coords.get(7, 7), Pieces.WHITE_ROOK);

  assertFalse(board.canCastle(7, Color.WHITE, new Set()));
});

Deno.test("castling through check", () => {
  const board = new Board();
  board.set(Coords.get(7, 0), Pieces.WHITE_ROOK);
  board.set(Coords.get(7, 4), Pieces.WHITE_KING);
  board.set(Coords.get(7, 7), Pieces.WHITE_ROOK);
  const attackedCoordsSet = new Set([Coords.get(7, 6)]);

  assertFalse(board.canCastle(7, Color.WHITE, attackedCoordsSet));
});

Deno.test("forward pawn coords #1", () => {
  const board = new Board();
  board.set(Coords.get(6, 0), Pieces.WHITE_PAWN);
  const forwardCoords = [...board.forwardPawnCoords(Color.WHITE, Coords.get(6, 0))];

  assertArrayIncludes(forwardCoords, [Coords.get(5, 0), Coords.get(4, 0)]);
});

Deno.test("forward pawn coords #2", () => {
  const board = new Board();
  board.set(Coords.get(6, 0), Pieces.WHITE_PAWN);
  board.set(Coords.get(4, 0), Pieces.BLACK_PAWN);
  const forwardCoords = [...board.forwardPawnCoords(Color.WHITE, Coords.get(6, 0))];

  assertArrayIncludes(forwardCoords, [Coords.get(5, 0)]);
  assertFalse(forwardCoords.includes(Coords.get(4, 0)));
});

Deno.test("clone", () => {
  const board = new Board();
  board.set(Coords.get(7, 0), Pieces.WHITE_ROOK);
  board.set(Coords.get(7, 4), Pieces.WHITE_KING);
  board.set(Coords.get(7, 7), Pieces.WHITE_ROOK);

  assertEquals(board.toString(), board.clone().toString());
});

Deno.test("stringify", () => {
  const boardStr = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
  const board = Board.fromString(boardStr);
  assertEquals(board.toString(), boardStr, `${boardStr} -> ${board.toString()}`);
});