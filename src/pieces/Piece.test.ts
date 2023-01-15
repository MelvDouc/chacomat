import { Color } from "../utils/constants.js";
import Piece, { Knight, Queen, Pawn } from "./index.js";

describe("Piece", () => {
  it("n should be a black knight", () => {
    const piece = Piece.fromInitial("n");
    console.log(Piece.constructors);

    expect(piece.color).toBe(Color.BLACK);
    expect(piece instanceof Knight).toBe(true);
  });

  it("P should be a white pawn", () => {
    const piece = Piece.fromInitial(Piece.WHITE_PIECE_INITIALS.PAWN);

    expect(piece.color).toBe(Color.WHITE);
    expect(piece instanceof Pawn).toBe(true);
  });

  it("Q should produce a queen", () => {
    const pawn = new Pawn({ color: Color.WHITE });

    expect(pawn.promote(Piece.WHITE_PIECE_INITIALS.QUEEN) instanceof Queen).toBe(true);
  });
});