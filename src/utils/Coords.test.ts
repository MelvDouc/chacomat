import Coords from "@chacomat/utils/Coords.js";

describe("notationToCoords", () => {
  it("e4 should be {x: 4, y: 4}", () => {
    expect(Coords.fromNotation("e4")).toEqual({ x: 4, y: 4 });
  });
});

describe("coordsToNotation", () => {
  it("{x: 4, y: 4} should be e4", () => {
    expect(Coords(4, 4).notation).toBe("e4");
  });
});