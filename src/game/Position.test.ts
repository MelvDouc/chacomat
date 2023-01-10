import Position from "./Position.js";

describe("FEN string", () => {
  it("should be produce itself", () => {
    const pos = Position.fromFenString(Position.startFenString);

    expect(pos.toString()).toBe(Position.startFenString);
  });

  it("should be valid after a move", () => {
    const pos1 = Position.fromFenString(
      `r5k1/p3rppp/1p2pn2/PP1bN3/8/2R1PP2/4B1PP/R5K1 b - - 0 24`,
    );
    const pos2 = pos1.getPositionFromMove(
      { x: 2, y: 1 },
      { x: 3, y: 0 },
      "Q",
      true,
    );

    expect(pos2.toString()).toBe(`r5k1/p3rppp/4pn2/pP1bN3/8/2R1PP2/4B1PP/R5K1 w - - 0 25`);
  });
});