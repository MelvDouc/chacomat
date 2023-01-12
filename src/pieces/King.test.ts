import Position from "../game/Position.js";
import King from "./King.js";

describe("A king", () => {
  it("should be able to castle with no squares between it and a rook", () => {
    const pos = Position.fromFenString("4k3/8/8/8/8/8/8/R3KBNR w KQ - 0 1");
    const { legalMovesAsNotation } = pos;

    expect(legalMovesAsNotation).toContain("e1-c1");
    expect(legalMovesAsNotation).not.toContain("e1-g1");
  });
});