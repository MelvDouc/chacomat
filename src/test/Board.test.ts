import { getCoords } from "@src/constants/Coords.js";
import Piece from "@src/constants/Piece.js";
import Board from "@src/game/Board.js";
import assert from "node:assert";
import { describe, it } from "node:test";

describe("A board", () => {
  it("should be stringifiable", () => {
    const pawnsOnlyFen = "8/pppppppp/8/8/8/8/PPPPPPPP/8";
    const board = new Board();

    for (let y = 0; y < 8; y++) {
      board.set(-1, getCoords(1, y), Piece.BLACK_PAWN);
      board.set(1, getCoords(6, y), Piece.WHITE_PAWN);
    }

    assert(board.toString() === pawnsOnlyFen);
  });
});

describe("Insufficient material", () => {
  it("should be detected with only kings", () => {
    const board = Board.parse("k7/8/8/8/8/8/8/7K");
    assert(board.isInsufficientMaterial());
  });

  it("should be detected with a lone knight", () => {
    const board = Board.parse("k7/8/8/8/8/8/8/6NK");
    assert(board.isInsufficientMaterial());
  });

  it("should be detected with a lone bishop", () => {
    const board = Board.parse("k7/8/8/8/8/8/8/6BK");
    assert(board.isInsufficientMaterial());
  });

  it("should be detected with N v N", () => {
    const board = Board.parse("kn6/8/8/8/8/8/8/6NK");
    assert(board.isInsufficientMaterial());
  });

  it("should not be detected with N v B", () => {
    const board = Board.parse("kn6/8/8/8/8/8/8/6BK");
    assert(!board.isInsufficientMaterial());
  });

  it("should be detected with same-colored bishops", () => {
    const board = Board.parse("k7/8/8/8/8/8/8/B1B1B1BK");
    assert(board.isInsufficientMaterial());
  });

  it("should not be detected with opposite-colored bishops", () => {
    const board = Board.parse("kb6/8/8/8/8/8/8/5B1K");
    assert(!board.isInsufficientMaterial());
  });
});