import Position from "@src/game/Position.js";
import assert from "node:assert";
import { describe, it } from "node:test";

describe("A position", () => {
  it("should be stringifiable", () => {
    const position = Position.fromFen(Position.startFen);
    assert(position.toString() === Position.startFen);
  });
});

describe("Insufficient material", () => {
  it("should be detected with only kings", () => {
    const position = Position.fromFen("k7/8/8/8/8/8/8/7K w - - 0 1");
    assert(position.isInsufficientMaterial());
  });

  it("should be detected with a lone knight", () => {
    const position = Position.fromFen("k7/8/8/8/8/8/8/6NK w - - 0 1");
    assert(position.isInsufficientMaterial());
  });

  it("should be detected with a lone bishop", () => {
    const position = Position.fromFen("k7/8/8/8/8/8/8/6BK w - - 0 1");
    assert(position.isInsufficientMaterial());
  });

  it("should be detected with N v N", () => {
    const position = Position.fromFen("kn6/8/8/8/8/8/8/6NK w - - 0 1");
    assert(position.isInsufficientMaterial());
  });

  it("should not be detected with N v B", () => {
    const position = Position.fromFen("kn6/8/8/8/8/8/8/6BK w - - 0 1");
    assert(!position.isInsufficientMaterial());
  });

  it("should be detected with same-colored bishops", () => {
    const position = Position.fromFen("k7/8/8/8/8/8/8/B1B1B1BK w - - 0 1");
    assert(position.isInsufficientMaterial());
  });

  it("should not be detected with opposite-colored bishops", () => {
    const position = Position.fromFen("kb6/8/8/8/8/8/8/5B1K w - - 0 1");
    assert(!position.isInsufficientMaterial());
  });
});