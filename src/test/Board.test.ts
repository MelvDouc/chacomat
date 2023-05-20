import Coords, { getCoords } from "@src/constants/Coords.js";
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

  it("should be clonable", () => {
    const boardStr = "2kr1n2/Q5p1/p7/1p3b2/2p5/P3BP2/5KPP/7q";
    const board = new Board(boardStr);
    assert(board.clone().toString() === boardStr);
  });
});

describe("Legal moves", () => {
  it("should include all king moves", () => {
    const board = new Board("7k/8/6K1/6P1/8/8/8/8");
    const legalMoves = [
      [Coords.g6, Coords.h5],
      [Coords.g6, Coords.h6],
      [Coords.g6, Coords.h7],
      [Coords.g6, Coords.g7],
      [Coords.g6, Coords.f7],
      [Coords.g6, Coords.f6],
      [Coords.g6, Coords.f5]
    ];
    const moves = [...board.pseudoLegalMoves(1, null)];
    assert(legalMoves.length === moves.length, `Different number of moves: ${JSON.stringify(moves, null, 4)}`);
    assert(
      legalMoves.every(([srcCoords, destCoords]) => {
        return moves.some(([src, dest]) => src === srcCoords && dest === destCoords);
      })
    );
  });
});

describe("Insufficient material", () => {
  it("should be detected with only kings", () => {
    const board = new Board("k7/8/8/8/8/8/8/7K");
    assert(board.isInsufficientMaterial());
  });

  it("should be detected with a lone knight", () => {
    const board = new Board("k7/8/8/8/8/8/8/6NK");
    assert(board.isInsufficientMaterial());
  });

  it("should be detected with a lone bishop", () => {
    const board = new Board("k7/8/8/8/8/8/8/6BK");
    assert(board.isInsufficientMaterial());
  });

  it("should not be detected with N v N", () => {
    const board = new Board("kn6/8/8/8/8/8/8/6NK");
    assert(!board.isInsufficientMaterial());
  });

  it("should not be detected with N v B", () => {
    const board = new Board("kn6/8/8/8/8/8/8/6BK");
    assert(!board.isInsufficientMaterial());
  });

  it("should not be detected with opposite-colored bishops", () => {
    const board = new Board("kb6/8/8/8/8/8/8/5B1K");
    assert(!board.isInsufficientMaterial());
  });
});