import Color from "@chacomat/constants/Color.js";
import Wing from "@chacomat/constants/Wing.js";
import CastlingRights from "@chacomat/game/CastlingRights.js";
import ChessGame from "@chacomat/game/ChessGame.js";

describe("Castling rights", () => {
  it("should be convertible from string to object", () => {
    const castlingRights = CastlingRights.fromString("KQk");

    expect(castlingRights[Color.WHITE]).toContain(Wing.KING_SIDE);
    expect(castlingRights[Color.WHITE]).toContain(Wing.QUEEN_SIDE);
    expect(castlingRights[Color.BLACK]).not.toContain(Wing.QUEEN_SIDE);
    expect(castlingRights[Color.BLACK]).toContain(Wing.KING_SIDE);
  });

  it("should be convertible from object to string", () => {
    const castlingRights = CastlingRights.fromString("KQkq");
    castlingRights.unset(Color.WHITE, Wing.KING_SIDE);

    expect(castlingRights.toString()).toBe("Qkq");
  });

  it("should be unset on king move", () => {
    const game = new ChessGame();
    game
      .moveWithNotations("e2", "e3")
      .moveWithNotations("e7", "e6")
      .moveWithNotations("e1", "e2");

    const whiteCR = game.currentPosition.castlingRights[Color.WHITE];
    expect(whiteCR).not.toContain(Wing.QUEEN_SIDE);
    expect(whiteCR).not.toContain(Wing.KING_SIDE);
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

    expect(game.currentPosition.castlingRights[Color.BLACK]).not.toContain(Wing.QUEEN_SIDE);
    expect(game.currentPosition.castlingRights[Color.BLACK]).toContain(Wing.KING_SIDE);
  });
});