import { Color, SquareIndex, Board, Pieces } from "$src/index.js";
import { expect } from "chai";
import { describe, it } from "node:test";

describe("The Board class", () => {
  it("should be able to parse a string", () => {
    const board = Board.fromString("8/2K1k3/8/8/8/8/8/8");
    const pieceAtC7 = board.get(SquareIndex.c7);
    const pieceAtE7 = board.get(SquareIndex.e7);

    expect(pieceAtC7?.isKing()).to.be.true;
    expect(pieceAtC7?.color).to.equal(Color.White);
    expect(pieceAtE7?.isKing()).to.be.true;
    expect(pieceAtE7?.color).to.equal(Color.Black);
  });

  it("should be clonable", () => {
    const board = Board.fromString("8/2K1k3/8/8/8/8/8/8");
    const clone = board.clone();
    expect(board.equals(clone)).to.be.true;
  });

  it("should be serializable", () => {
    const boardStr = "8/2K1k3/8/8/8/8/8/8";
    const board = Board.fromString(boardStr);
    expect(board.toString()).to.equal(boardStr);
  });

  it("should have auto-updating occupancy", () => {
    const board = Board.fromString("8/2K1k3/8/8/8/8/8/8");
    board
      .remove(SquareIndex.c7)
      .set(SquareIndex.b7, Pieces.WHITE_KING);
    expect(board.has(SquareIndex.c7)).to.be.false;
    expect(board.get(SquareIndex.b7)).to.equal(Pieces.WHITE_KING);
  });

});
