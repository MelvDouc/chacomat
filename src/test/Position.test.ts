import Coords from "@src/constants/Coords.js";
import Position from "@src/game/Position.js";
import playMove from "@src/moves/play-move.js";
import assert from "node:assert";
import { describe, it } from "node:test";

describe("playMove", () => {
  it("should update the half-move clock on pawn move", () => {
    const position = Position.fromFen("k7/8/8/8/8/8/P7/K7 w - - 49 120");
    const next = playMove(position, Coords.a2, Coords.a4);
    assert(next.halfMoveClock === 0, String(next.halfMoveClock));
  });

  it("should update the half-move clock on capture", () => {
    const position = Position.fromFen("k7/8/8/8/q7/8/R7/K7 w - - 49 120");
    const next = playMove(position, Coords.a2, Coords.a4);
    assert(next.halfMoveClock === 0, String(next.halfMoveClock));
  });

  it("should increment it otherwise", () => {
    const position = Position.fromFen("k7/8/8/8/q7/8/R7/K7 w - - 49 120");
    const next = playMove(position, Coords.a2, Coords.a3);
    assert(next.halfMoveClock === position.halfMoveClock + 1, String(next.halfMoveClock));
  });
});