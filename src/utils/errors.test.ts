import ChessGame from "@game/ChessGame.js";

describe("IllegalMoveError", () => {
  it("should be thrown on an illegal move", () => {
    const game = new ChessGame();

    expect(() => game.moveWithNotations("e2", "e5")).toThrow(ChessGame.IllegalMoveError);
  });
});

describe("InactiveGameError", () => {
  it("should be thrown after checkmate", () => {
    const game = new ChessGame();
    game
      .moveWithNotations("f2", "f3")
      .moveWithNotations("e7", "e6")
      .moveWithNotations("g2", "g4")
      .moveWithNotations("d8", "h4");

    expect(() => game.moveWithNotations("e1", "f2")).toThrow(ChessGame.InactiveGameError);
  });
});

describe("InvalidCoordsError", () => {
  it("should be thrown when attempting to play a move invalid coordinates", () => {
    const game = new ChessGame();

    expect(() => game.move({ x: -1, y: 4 }, { y: 4, x: 4 })).toThrow(ChessGame.InvalidCoordsError);
  });
});

