import ChessGame from "@chacomat/game/ChessGame.js";
import Pawn from "@chacomat/pieces/Pawn.js";
import Coords from "@chacomat/utils/Coords.js";

describe("A board", () => {
  it("should be serializable", () => {
    const { board } = new ChessGame({ fen: "k7/8/8/8/8/8/8/7K w - - 0 1" }).currentPosition;

    for (let y = 0; y < 8; y++) {
      board.set(Coords.get(1, y), new Pawn("BLACK"));
      board.set(Coords.get(6, y), new Pawn("WHITE"));
    }

    expect("k7/pppppppp/8/8/8/8/PPPPPPPP/7K").toBe(board.toString());
  });
});

describe("A piece array from the start position", () => {
  const pieceArray = ChessGame.Position
    .fromFenString(ChessGame.Position.startFenString)
    .board
    .toArray();

  it("should only have pawns on rows 1 and 6", () => {
    expect(pieceArray[1].every((piece) => piece?.isPawn())).toBe(true);
    expect(pieceArray[6].every((piece) => piece?.isPawn())).toBe(true);
  });

  it("should have empty rows from row 2 to 5", () => {
    expect(
      pieceArray.slice(2, 6).every((row) => row.every((square) => square === null))
    ).toBe(true);
  });
});