import Color from "../constants/Color.js";
import ChessGame from "../game/ChessGame.js";
import Coords from "../game/Coords.js";
import King from "./King.js";

const c1 = Coords.fromNotation("c1")!;
const d1 = Coords.fromNotation("d1")!;
const e1 = Coords.fromNotation("e1")!;
const g1 = Coords.fromNotation("g1")!;
const g2 = Coords.fromNotation("g2")!;

describe("A king", () => {
  it("should be able to castle with no squares between it and a rook", () => {
    const game = new ChessGame({
      fenString: "4k3/8/8/8/8/8/8/R3KBNR w KQ - 0 1"
    });
    const { legalMovesAsNotation } = game.currentPosition;

    expect(legalMovesAsNotation).toContain("e1-c1");
    expect(legalMovesAsNotation).not.toContain("e1-g1");
  });

  it("should not be able to castle through check", () => {
    const game = new ChessGame({
      fenString: "2r1k3/8/8/8/8/8/8/R3KBNR w KQ - 0 1"
    }),
      pos = game.currentPosition;
    const whiteKing = pos.board.kings[Color.WHITE];
    const castlingCoords = [
      ...whiteKing.castlingCoords(pos.attackedCoordsSet, pos)
    ];

    expect(castlingCoords).not.toContain(c1);
  });
});

describe("Chess960", () => {
  it("should implement castling", () => {
    const game = new ChessGame({
      fenString: "nbbqrkrn/pppppppp/8/8/8/8/8/NB2RKR1 w KQkq - 0 1",
      isChess960: true
    });
    const pos = game.currentPosition,
      { board } = pos;
    const whiteKing = board.kings[Color.WHITE];
    const castlingCoords = [
      ...whiteKing.castlingCoords(pos.attackedCoordsSet, pos)
    ];

    expect(castlingCoords).toContain(e1);
    expect(castlingCoords).toContain(g1);
  });
  it(" - king and rook should placed correctly after castling", () => {
    const game = new ChessGame({
      fenString: "nbbqrkrn/pppppppp/8/8/8/8/8/NB2RKR1 w KQkq - 0 1",
      isChess960: true
    });
    const kingCoords = game.currentPosition.board.kings[Color.WHITE].coords;
    const posAfter = game.move(kingCoords, Coords.fromNotation("e1")!).currentPosition;

    expect(posAfter.board.get(c1)!.whiteInitial).toBe(King.whiteInitial);
    expect(posAfter.board.get(d1)!.whiteInitial).toBe("R");
  });
});