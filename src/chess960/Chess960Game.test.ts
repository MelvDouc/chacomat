import Chess960Game from "@chacomat/chess960/Chess960Game.js";
import Chess960Position from "@chacomat/chess960/Chess960Position.js";
import Chess960CastlingRights from "@chacomat/chess960/Chess960CastlingRights.js";
import Color from "@chacomat/utils/Color.js";

describe("A Chess960 game", () => {
  it("should detect check", () => {
    const game = new Chess960Game({
      fen: "bbrnknrq/pppppppp/8/8/8/8/PPPPPPPP/BBRNKNRQ w CFcf - 0 1"
    })
      .moveWithNotations("g2", "g4")
      .moveWithNotations("d8", "c6")
      .moveWithNotations("h1", "e4")
      .moveWithNotations("f8", "g6")
      .moveWithNotations("e4", "e7");

    expect(game.currentPosition.isCheck()).toBe(true);
  });

  it("should have correct castling rights", () => {
    const position = new Chess960Game().currentPosition;
    console.log(position.toString());
    const { castlingRights } = position;

    expect(new Set(castlingRights[Color.WHITE]).size).toBe(2);
    expect(new Set(castlingRights[Color.BLACK]).size).toBe(2);
  });

  it("should allow castling", () => {
    const { currentPosition } = new Chess960Game({
      fen: "k7/pppppppp/8/8/8/8/PPPPPPPP/1R4KR b BH - 0 1"
    })
      .moveWithNotations("a8", "b8");
    const { castlingRights, colorToMove, legalMovesAsNotation } = currentPosition;

    expect(currentPosition).toBeInstanceOf(Chess960Position);
    expect(castlingRights).toBeInstanceOf(Chess960CastlingRights);
    expect(currentPosition.isCheck()).toBe(false);
    expect(castlingRights[colorToMove]).toContain(1);
    expect(castlingRights[colorToMove]).toContain(7);
    expect(legalMovesAsNotation).toContain("g1-b1");
    expect(legalMovesAsNotation).toContain("g1-h1");
  });
});