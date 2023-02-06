import CastlingRights from "@chacomat/game/CastlingRights.js";
import ChessGame from "@chacomat/game/ChessGame.js";

describe("Castling rights", () => {
  it("should be convertible from string to object", () => {
    const castlingRights = CastlingRights.fromString("KQk");

    expect(castlingRights.WHITE).toContain(7);
    expect(castlingRights.WHITE).toContain(0);
    expect(castlingRights.BLACK).not.toContain(0);
    expect(castlingRights.BLACK).toContain(7);
  });

  it("should be convertible from object to string", () => {
    const castlingRights = CastlingRights.fromString("KQkq");
    castlingRights.unset("WHITE", 7);

    expect(castlingRights.toString()).toBe("Qkq");
  });

  it("should be unset on king move", () => {
    const whiteCR = new ChessGame()
      .moveWithNotations("e2", "e3")
      .moveWithNotations("e7", "e6")
      .moveWithNotations("e1", "e2")
      .currentPosition
      .castlingRights.WHITE;

    expect(whiteCR).not.toContain(0);
    expect(whiteCR).not.toContain(7);
  });

  it("should be updated on rook capture", () => {
    const blackCR = new ChessGame()
      .moveWithNotations("b1", "c3")
      .moveWithNotations("e7", "e6")
      .moveWithNotations("c3", "a4")
      .moveWithNotations("e6", "e5")
      .moveWithNotations("a4", "b6")
      .moveWithNotations("e5", "e4")
      .moveWithNotations("b6", "a8")
      .currentPosition
      .castlingRights.BLACK;

    expect(blackCR).not.toContain(0);
    expect(blackCR).toContain(7);
  });
});