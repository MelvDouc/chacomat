import { coordsToNotation, notationToCoords } from "./coords.js";

describe("notationToCoords", () => {
  it("e4 should be {x: 4, y: 4}", () => {
    expect(notationToCoords("e4")).toEqual({ x: 4, y: 4 });
  });
});

describe("coordsToNotation", () => {
  it("{x: 4, y: 4} should be e4", () => {
    expect(coordsToNotation({ x: 4, y: 4 })).toBe("e4");
  });
});