import Colors from "$src/constants/Colors";
import { indexTable } from "$src/constants/SquareIndex";
import { BOARD_WIDTH } from "$src/constants/dimensions";
import Board from "$src/game/Board";
import Pieces from "$src/pieces/Pieces";
import { expect, test } from "bun:test";

test("colors", () => {
  for (const piece of Pieces.whitePieces())
    expect(piece.color).toEqual(Colors.WHITE);
  for (const piece of Pieces.blackPieces())
    expect(piece.color).toEqual(Colors.BLACK);
});

test("types", () => {
  expect(Pieces.BLACK_BISHOP.isBishop()).toBeTrue();
  expect(Pieces.WHITE_QUEEN.isQueen()).toBeTrue();
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
