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
      .moveWithNotations("e2", "e4")
      .moveWithNotations("e7", "e5")
      .moveWithNotations("d1", "h5")
      .moveWithNotations("b8", "c6")
      .moveWithNotations("f1", "c4")
      .moveWithNotations("g8", "f6")
      .moveWithNotations("h5", "f7");

    expect(() => game.moveWithNotations("c6", "d4")).toThrow(ChessGame.errors.InactiveGameError);
  });
});