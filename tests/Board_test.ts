import Color from "$src/constants/Color.js";
import SquareIndex from "$src/constants/SquareIndex.js";
import Board from "$src/game/Board.js";
import Pieces from "$src/pieces/Pieces.js";
import { expect } from "expect";
import { test } from "node:test";

test("Get board from string.", () => {
  const board = Board.fromString("8/2K1k3/8/8/8/8/8/8");
  const pieceAtC7 = board.get(SquareIndex.c7);
  const pieceAtE7 = board.get(SquareIndex.e7);

  expect(pieceAtC7?.isKing()).toBe(true);
  expect(pieceAtC7?.color).toEqual(Color.White);
  expect(pieceAtE7?.isKing()).toBe(true);
  expect(pieceAtE7?.color).toEqual(Color.Black);
});

test("board cloning", () => {
  const board = Board.fromString("8/2K1k3/8/8/8/8/8/8");
  const clone = board.clone();
  expect(board.equals(clone)).toBe(true);
});

test("A board should be stringifiable and parsable from the same string.", () => {
  const boardStr = "8/2K1k3/8/8/8/8/8/8";
  const board = Board.fromString(boardStr);
  expect(board.toString()).toEqual(boardStr);
});

test("Board occupancy should auto-updated.", () => {
  const board = Board.fromString("8/2K1k3/8/8/8/8/8/8");
  board
    .remove(SquareIndex.c7)
    .set(SquareIndex.b7, Pieces.WHITE_KING);
  expect(board.has(SquareIndex.c7)).toBe(false);
  expect(board.get(SquareIndex.b7)).toEqual(Pieces.WHITE_KING);
});