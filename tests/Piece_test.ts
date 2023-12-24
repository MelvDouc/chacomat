import { BOARD_WIDTH } from "$src/constants/dimensions.js";
import { Board, Color, Pieces, indexTable } from "$src/index.js";
import { expect } from "chai";
import { describe, it } from "node:test";

describe("Pieces", () => {
  it("should have their expected colors", () => {
    for (const piece of Pieces.whitePieces())
      expect(piece.color).to.equal(Color.White);
    for (const piece of Pieces.blackPieces())
      expect(piece.color).to.equal(Color.Black);
  });

  it("should have their expected types", () => {
    const piece = Pieces.allPieces()[Math.floor(Math.random() * Pieces.allPieces().length)];
    const isMethod = `is${piece.constructor.name}` as IsPieceMethod;
    expect(piece[isMethod]()).to.be.true;
  });

  it("should have their expected initials", () => {
    expect(Pieces.BLACK_PAWN.initial.toUpperCase()).to.equal(Pieces.WHITE_PAWN.initial);
    expect(Pieces.WHITE_QUEEN.initial).to.equal("Q");
    expect(Pieces.BLACK_KNIGHT.initial).to.equal("n");
  });

  it("should have their expected opposites", () => {
    expect(Pieces.WHITE_ROOK.opposite).to.equal(Pieces.BLACK_ROOK);
    expect(Pieces.BLACK_ROOK.opposite).to.equal(Pieces.WHITE_ROOK);
  });

  it("A rook should always attack 14 squares.", () => {
    const board = new Board();
    const index = indexTable[randomCoord()][randomCoord()];
    board.set(index, Pieces.WHITE_ROOK);
    const attacks = Pieces.WHITE_ROOK.getAttacks(index, board);
    expect(attacks).to.have.length(14);
  });
});

function randomCoord() {
  return Math.floor(Math.random() * BOARD_WIDTH);
}

type Piece = import("$src/index.js").Piece;
type IsPieceMethod = keyof ({
  [K in keyof Piece as Piece[K] extends (() => boolean) ? K : never]: Piece[K]
});