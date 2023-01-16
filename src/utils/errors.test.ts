import ChessGame from "@chacomat/game/ChessGame.js";

describe("IllegalMoveError", () => {
  it("should be thrown on an illegal move", () => {
    const game = new ChessGame();

    expect(() => game.moveWithNotations("e2", "e5")).toThrow(ChessGame.errors.IllegalMoveError);
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

    expect(() => game.moveWithNotations("e1", "f2")).toThrow(ChessGame.errors.InactiveGameError);
  });
});