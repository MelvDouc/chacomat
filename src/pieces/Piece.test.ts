import { Color } from "@chacomat/utils/constants.js";
import Piece, { Knight, Queen, Pawn } from "@chacomat/pieces/index.js";

describe("Piece", () => {
  it("n should be a black knight", () => {
    const piece = Piece.fromInitial("n");

    expect(piece.color).toBe(Color.BLACK);
    expect(piece instanceof Knight).toBe(true);
  });

  it("P should be a white pawn", () => {
    const piece = Piece.fromInitial(Piece.PIECE_TYPES.PAWN);

    expect(piece.color).toBe(Color.WHITE);
    expect(piece instanceof Pawn).toBe(true);
  });

  it("Q should produce a queen", () => {
    const pawn = new Pawn({ color: Color.WHITE });

    expect(pawn.promote(Piece.PIECE_TYPES.QUEEN) instanceof Queen).toBe(true);
  });
});