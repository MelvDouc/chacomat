import { describe, it } from "node:test";
import { strictEqual } from "node:assert";
import Position from "./Position.js";

describe("FEN string", () => {
  it("should be produce itself", () => {
    const pos = Position.fromFenString(Position.startFenString);

    strictEqual(
      pos.toString(),
      Position.startFenString,
    );
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

    strictEqual(
      pos2.toString(),
      `r5k1/p3rppp/4pn2/pP1bN3/8/2R1PP2/4B1PP/R5K1 w - - 0 25`,
    );
  });
});