import Chess960CastlingRights from "@chacomat/chess960/Chess960CastlingRights.js";
import fenChecker from "@chacomat/utils/fen-checker.js";

describe("Chess960CastlingRights", () => {
  it("should parse a castling string correctly #1", () => {
    const castlingRights = Chess960CastlingRights.fromString("BGbg");

    expect(castlingRights.WHITE).toContain(1);
    expect(castlingRights.WHITE).toContain(6);
    expect(castlingRights.BLACK).toContain(1);
    expect(castlingRights.BLACK).toContain(6);
  });

  it("should parse a castling string correctly #2", () => {
    const castlingRights = Chess960CastlingRights.fromString("De");

    expect(castlingRights.WHITE).toContain(3);
    expect(castlingRights.WHITE).toHaveLength(1);
    expect(castlingRights.BLACK).toContain(4);
    expect(castlingRights.BLACK).toHaveLength(1);
  });

  it("should be stringifiable #1", () => {
    const castlingRights = new Chess960CastlingRights();
    castlingRights.WHITE.push(3, 5);
    castlingRights.BLACK.push(3, 5);
    expect(castlingRights.toString()).toBe("DFdf");
  });

  it("should be stringifiable #2", () => {
    const castlingRights = new Chess960CastlingRights();
    expect(castlingRights.toString()).toBe(fenChecker.nullCharacter);
  });
});