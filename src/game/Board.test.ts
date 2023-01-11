import Board from "./Board.js";
import Color from "../constants/Color.js";
import { King, Pawn } from "../pieces/Piece.js";

describe("A board", () => {
  it("should be serializable", () => {
    const board = new Board();

    board.set(board.Coords.get(0, 0)!, new King(Color.BLACK));
    board.set(board.Coords.get(7, 7)!, new King(Color.WHITE));

    for (let y = 0; y < 8; y++) {
      board.set(board.Coords.get(1, y)!, new Pawn(Color.BLACK));
      board.set(board.Coords.get(6, y)!, new Pawn(Color.WHITE));
    }

    expect("k7/pppppppp/8/8/8/8/PPPPPPPP/7K").toBe(board.toString());
  });
});