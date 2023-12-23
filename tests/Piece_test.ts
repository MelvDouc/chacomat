import { BOARD_WIDTH } from "$src/constants/dimensions.js";
import { Board, Color, Pieces, indexTable } from "$src/index.js";
import { expect } from "expect";
import { test } from "node:test";

test("colors", () => {
  for (const piece of Pieces.whitePieces())
    expect(piece.color).toEqual(Color.White);
  for (const piece of Pieces.blackPieces())
    expect(piece.color).toEqual(Color.Black);
});

test("types", () => {
  expect(Pieces.BLACK_BISHOP.isBishop()).toBe(true);
  expect(Pieces.WHITE_QUEEN.isQueen()).toBe(true);
});

test("initials", () => {
  expect(Pieces.BLACK_PAWN.initial.toUpperCase()).toBe(Pieces.WHITE_PAWN.initial);
  expect(Pieces.WHITE_QUEEN.initial).toBe("Q");
  expect(Pieces.BLACK_KNIGHT.initial).toBe("n");
});

test("opposites", () => {
  expect(Pieces.WHITE_ROOK.opposite).toBe(Pieces.BLACK_ROOK);
  expect(Pieces.BLACK_ROOK.opposite).toBe(Pieces.WHITE_ROOK);
});

test("A rook should always attack 14 squares.", () => {
  const board = new Board();
  const index = indexTable[randomCoord()][randomCoord()];
  board.set(index, Pieces.WHITE_ROOK);
  const attacks = Pieces.WHITE_ROOK.getAttacks(index, board);
  expect(attacks).toHaveLength(14);
});

function randomCoord() {
  return Math.floor(Math.random() * BOARD_WIDTH);
}
