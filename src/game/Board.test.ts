import Board from "./Board.js";
import Color from "../constants/Color.js";
import { King, Pawn } from "../pieces/Piece.js";
import Position from "./Position.js";
import exp from "constants";

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

describe("A piece array from the start position", () => {
  const position = Position.fromFenString(Position.startFenString);
  const pieceArray = position.board.getPieceArray();
  it("should only have pawns rows 1 and 6", () => {
    expect(pieceArray[1].every((piece) => piece instanceof Pawn)).toBe(true);
    expect(pieceArray[6].every((piece) => piece instanceof Pawn)).toBe(true);
  });
  it("should have empty rows from row 2 to 5", () => {
    expect(
      pieceArray.slice(2, 6).every((row) => {
        return row.every((square) => square === null);
      })
    ).toBe(true);
  });
});