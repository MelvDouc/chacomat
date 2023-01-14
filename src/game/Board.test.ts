import Pawn from "../pieces/Pawn.js";
import Position from "./Position.js";
import { Color } from "../utils/constants.js";
import ChessGame from "./ChessGame.js";

describe("A board", () => {
  it("should be serializable", () => {
    const game = new ChessGame({
      fenString: "k7/8/8/8/8/8/8/7K w - - 0 1"
    }),
      board = game.currentPosition.board;

    for (let y = 0; y < 8; y++) {
      const c = board.Coords.get(1, y);
      board.set(c, new Pawn({ color: Color.BLACK, coords: c, board }));
      const c2 = board.Coords.get(6, y);
      board.set(c2, new Pawn({ color: Color.WHITE, coords: c2, board }));
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