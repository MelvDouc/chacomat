import ChessGame from "@chacomat/game/ChessGame.js";
import Position from "@chacomat/game/Position.js";
import { IllegalMoveError, InactiveGameError, InvalidFenError } from "@chacomat/utils/errors.js";

describe("IllegalMoveError", () => {
  it("should be thrown on an illegal move", () => {
    const game = new ChessGame();

    expect(() => game.moveWithNotations("e2", "e5")).toThrow(IllegalMoveError);
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

    expect(() => game.moveWithNotations("c6", "d4")).toThrow(InactiveGameError);
  });
});

describe("InvalidFenError", () => {
  expect(() => Position.fromFenString(Position.startFenString.replace("8", "9"))).toThrow(InvalidFenError);
});