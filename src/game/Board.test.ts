import Board from "./Board.js";
import Piece from "../pieces/Piece.js";
import Color from "../constants/Color.js";

describe("A board", () => {
  it("should be serializable", () => {
    const board = new Board();

    board.set({ x: 0, y: 0 }, new Piece(Color.BLACK, Piece.Types.KING));
    board.set({ x: 7, y: 7 }, new Piece(Color.WHITE, Piece.Types.KING));

    for (let y = 0; y < 8; y++) {
      board.set({ x: 1, y }, new Piece(Color.BLACK, Piece.Types.PAWN));
      board.set({ x: 6, y }, new Piece(Color.WHITE, Piece.Types.PAWN));
    }

    expect("k7/pppppppp/8/8/8/8/PPPPPPPP/7K").toBe(board.toString());
  });
});