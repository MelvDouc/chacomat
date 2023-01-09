import { describe, it } from "node:test";
import assert from "node:assert";
import Board from "./Board.js";
import Piece from "../pieces/Piece.js";
import Color from "../constants/Color.js";

describe("A board", () => {
  it("should be serializable", () => {
    const board = new Board();
    for (let x = 0; x < 8; x++) {
      board.push(Array(8).fill(null));
    }
    board[0][0] = new Piece(Color.BLACK, Piece.Types.KING);
    board[1] = Array.from({ length: 8 }, () => new Piece(Color.BLACK, Piece.Types.PAWN));
    board[6] = Array.from({ length: 8 }, () => new Piece(Color.WHITE, Piece.Types.PAWN));
    board[7][7] = new Piece(Color.WHITE, Piece.Types.KING);

    assert.strictEqual("k7/pppppppp/8/8/8/8/PPPPPPPP/7K", board.toString());
  });
});