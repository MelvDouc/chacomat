import Chess960CastlingRights from "@chacomat/chess960/Chess960CastlingRights.js";
import { Color } from "@chacomat/utils/constants.js";

describe("Chess960CastlingRights", () => {
  it("should parse a castling string correctly #1", () => {
    const castlingRights = Chess960CastlingRights.fromString("BGbg");

    expect(castlingRights[Color.WHITE]).toContain(1);
    expect(castlingRights[Color.WHITE]).toContain(6);
    expect(castlingRights[Color.BLACK]).toContain(1);
    expect(castlingRights[Color.BLACK]).toContain(6);
  });

  it("should parse a castling string correctly #2", () => {
    const castlingRights = Chess960CastlingRights.fromString("De");

    expect(castlingRights[Color.WHITE]).toContain(3);
    expect(castlingRights[Color.WHITE].length).toBe(1);
    expect(castlingRights[Color.BLACK]).toContain(4);
    expect(castlingRights[Color.BLACK].length).toBe(1);
  });

  it("should be stringifiable #1", () => {
    const castlingRights = new Chess960CastlingRights();
    castlingRights[Color.WHITE].push(3, 5);
    castlingRights[Color.BLACK].push(3, 5);
    expect(castlingRights.toString()).toBe("DFdf");
  });

  it("should be stringifiable #2", () => {
    const castlingRights = new Chess960CastlingRights();
    expect(castlingRights.toString()).toBe("-");
  });
});