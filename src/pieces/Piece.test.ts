import Color from "../constants/Color.js";
import Piece from "./Piece.js";

describe("Piece", () => {
  it("n should be a black knight", () => {
    const piece = Piece.fromInitial("n");

    expect(piece.color).toBe(Color.BLACK);
    expect(piece.type).toBe(Piece.Types.KNIGHT);
  });

  it("P should be a white pawn", () => {
    const piece = Piece.fromInitial("P");

    expect(piece.color).toBe(Color.WHITE);
    expect(piece.type).toBe(Piece.Types.PAWN);
  });

  it("Q should produce a queen", () => {
    const pawn = new Piece(Color.WHITE, Piece.Types.PAWN);

    expect(Piece.promote(pawn, "Q").type).toBe(Piece.Types.QUEEN);
  });
});