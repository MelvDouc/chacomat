import Position from "@src/game/Position.js";
import assert from "node:assert";
import { describe, it } from "node:test";

describe("A position", () => {
  it("should be stringifiable", () => {
    const position = Position.fromFen(Position.startFen);
    assert(position.toString() === Position.startFen);
  });
});