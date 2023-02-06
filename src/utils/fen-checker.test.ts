import Position from "@chacomat/game/Position.js";
import fenChecker from "@chacomat/utils/fen-checker.js";
import Chess960Game from "@chacomat/chess960/Chess960Game.js";

describe("fenChecker", () => {
  it("should validate a normal game starting position", () => {
    expect(
      fenChecker.isValidFenString(Position.startFenString)
    ).toBe(true);
  });

  it("should invalidate a missing full move number", () => {
    expect(
      fenChecker.isValidFenString(Position.startFenString.slice(-1))
    ).toBe(false);
  });

  it("should validate a Chess960 starting position FEN string", () => {
    const chess960Fen = new Chess960Game().currentPosition.toString();

    expect(fenChecker.isValidFenString(chess960Fen)).toBe(true);
  });
});