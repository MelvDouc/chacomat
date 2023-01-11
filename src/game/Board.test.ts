import Board from "./Board.js";
import Color from "../constants/Color.js";
import King from "../pieces/King.js";
import Pawn from "../pieces/Pawn.js";

describe("A board", () => {
  it("should be serializable", () => {
    const board = new Board();

    board.set({ x: 0, y: 0 }, new King(Color.BLACK));
    board.set({ x: 7, y: 7 }, new King(Color.WHITE));

    for (let y = 0; y < 8; y++) {
      board.set({ x: 1, y }, new Pawn(Color.BLACK));
      board.set({ x: 6, y }, new Pawn(Color.WHITE));
    }

    expect("k7/pppppppp/8/8/8/8/PPPPPPPP/7K").toBe(board.toString());
  });
});