import Color from "../constants/Color.js";
import Piece, { Knight, Pawn, Queen } from "./Piece.js";

describe("Piece", () => {
  it("n should be a black knight", () => {
    const piece = Piece.fromInitial("n");

    expect(piece.color).toBe(Color.BLACK);
    expect(piece instanceof Knight).toBe(true);
  });

  it("P should be a white pawn", () => {
    const piece = Piece.fromInitial("P");

    expect(piece.color).toBe(Color.WHITE);
    expect(piece instanceof Pawn).toBe(true);
  });

  it("Q should produce a queen", () => {
    const pawn = new Pawn(Color.WHITE);

    expect(pawn.promote("Q") instanceof Queen).toBe(true);
  });
});