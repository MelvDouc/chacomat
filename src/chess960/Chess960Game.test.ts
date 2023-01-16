import Chess960Game from "@chacomat/chess960/Chess960Game.js";
import Chess960Position from "@chacomat/chess960/Chess960Position.js";

describe("A Chess960 game", () => {
  it("should detect check", () => {
    const game = new Chess960Game({
      fenString: "bbrnknrq/pppppppp/8/8/8/8/PPPPPPPP/BBRNKNRQ w CFcf - 0 1"
    })
      .moveWithNotations("g2", "g4")
      .moveWithNotations("d8", "c6")
      .moveWithNotations("h1", "e4")
      .moveWithNotations("f8", "g6")
      .moveWithNotations("e4", "e7");

    expect(game.currentPosition.isCheck()).toBe(true);
  });

  it("should have correct castling rights", () => {
    const { castlingRights } = Chess960Game.getRandomGame().currentPosition;

    expect(new Set(castlingRights[Chess960Game.Colors.WHITE]).size).toBe(2);
    expect(new Set(castlingRights[Chess960Game.Colors.BLACK]).size).toBe(2);
  });

  it("should allow castling", () => {
    const { currentPosition } = new Chess960Game({
      fenString: "k7/pppppppp/8/8/8/8/PPPPPPPP/2R3KR b CH - 0 1"
    }).moveWithNotations("a8", "b8");
    const legalKingMoves = currentPosition.legalMovesAsNotation.filter((x) => x.startsWith("g1"));

    expect(currentPosition).toBeInstanceOf(Chess960Position);
    expect(currentPosition.isCheck()).toBe(false);
    expect(currentPosition.castlingRights[currentPosition.colorToMove]).toContain(2);
    expect(currentPosition.castlingRights[currentPosition.colorToMove]).toContain(7);
    expect(legalKingMoves).toContain("g1-c1");
    expect(legalKingMoves).toContain("g1-h1");
  });
});