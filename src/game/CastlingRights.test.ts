import CastlingRights from "@game/CastlingRights.js";
import ChessGame from "@game/ChessGame.js";
import { Color, Wing } from "@utils/constants.js";

describe("Castling rights", () => {
  it("should be convertible from string to object", () => {
    const castlingRights = CastlingRights.fromString("KQk");

    expect(castlingRights[Color.WHITE][Wing.KING_SIDE]).toBe(true);
    expect(castlingRights[Color.WHITE][Wing.QUEEN_SIDE]).toBe(true);
    expect(castlingRights[Color.BLACK][Wing.QUEEN_SIDE]).toBe(false);
    expect(castlingRights[Color.BLACK][Wing.KING_SIDE]).toBe(true);
  });

  it("should be convertible from object to string", () => {
    const castlingRights = new CastlingRights();
    castlingRights[Color.WHITE][Wing.KING_SIDE] = false;

    expect(castlingRights.toString()).toBe("Qkq");
  });

  it("should be unset on king move", () => {
    const game = new ChessGame();
    game
      .moveWithNotations("e2", "e3")
      .moveWithNotations("e7", "e6")
      .moveWithNotations("e1", "e2");

    const whiteCR = game.currentPosition.castlingRights[Color.WHITE];
    expect(whiteCR[Wing.QUEEN_SIDE]).toBe(false);
    expect(whiteCR[Wing.KING_SIDE]).toBe(false);
  });

  it("should be updated on rook capture", () => {
    const game = new ChessGame();
    game
      .moveWithNotations("b1", "c3")
      .moveWithNotations("e7", "e6")
      .moveWithNotations("c3", "a4")
      .moveWithNotations("e6", "e5")
      .moveWithNotations("a4", "b6")
      .moveWithNotations("e5", "e4")
      .moveWithNotations("b6", "a8");

    expect(game.currentPosition.castlingRights[Color.BLACK][Wing.QUEEN_SIDE]).toBe(false);
    expect(game.currentPosition.castlingRights[Color.BLACK][Wing.KING_SIDE]).toBe(true);
  });
});