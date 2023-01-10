import Colors from "../constants/Color.js";
import { notationToCoords } from "../constants/coords.js";
import Wings from "../constants/Wing.js";
import ChessGame from "./ChessGame.js";

describe("Checkmate", () => {
  it("#1", () => {
    const game = new ChessGame();
    game
      .moveWithNotations("f2", "f3")
      .moveWithNotations("e7", "e6")
      .moveWithNotations("g2", "g4")
      .moveWithNotations("d8", "h4");

    expect(game.currentPosition.status).toBe("checkmate");
  });
});

describe("en passant", () => {
  it("#1", () => {
    const game = new ChessGame();
    game
      .moveWithNotations("e2", "e4")
      .moveWithNotations("d7", "d5")
      .moveWithNotations("e4", "d5")
      .moveWithNotations("e7", "e5");

    expect(game.currentPosition.enPassantFile).toBe(notationToCoords("e6")!.y);
  });

  it("#2", () => {
    const game = new ChessGame();
    game
      .moveWithNotations("e2", "e4")
      .moveWithNotations("d7", "d5")
      .moveWithNotations("e4", "d5")
      .moveWithNotations("e7", "e5");

    expect(game.currentPosition.legalMovesAsNotation.includes(`d5-e6`)).toBe(true);
  });
});
