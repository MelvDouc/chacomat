import ChessGame from "@chacomat/game/ChessGame.js";
import Piece from "@chacomat/pieces/Piece.js";
import Color from "@chacomat/utils/Color.js";
import { notationToIndex } from "@chacomat/utils/Index.js";

describe("Piece", () => {
  it("n should be a black knight", () => {
    const piece = Piece.fromInitial("n");

    expect(piece.color).toBe(Color.BLACK);
    expect(piece.isKnight()).toBe(true);
  });

  it("P should be a white pawn", () => {
    const piece = Piece.fromInitial(Piece.TYPES.PAWN);

    expect(piece.color).toBe(Color.WHITE);
    expect(piece.isPawn()).toBe(true);
  });

  it("Q should produce a queen", () => {
    const pawn = new Piece({ color: Color.WHITE, type: Piece.TYPES.PAWN });
    pawn.type = Piece.TYPES.QUEEN;

    expect(pawn.isQueen()).toBe(true);
  });
});

const c1 = notationToIndex("c1");

describe("A king", () => {
  it("should be able to castle with no squares between it and a rook", () => {
    const { currentPosition } = new ChessGame({
      fenString: "4k3/8/8/8/8/8/8/R3KBNR w KQ - 0 1"
    });
    const { legalMovesAsNotation } = currentPosition;

    expect(legalMovesAsNotation).toContain("e1-c1");
    expect(legalMovesAsNotation).not.toContain("e1-g1");
  });

  it("should not be able to castle through check", () => {
    const game = new ChessGame({
      fenString: "2r1k3/8/8/8/8/8/8/R3KBNR w KQ - 0 1"
    });
    const whiteKing = game.currentPosition.board.kings[Color.WHITE];
    const castlingCoords = [
      ...Piece.castlingCoords(whiteKing, false)
    ];

    expect(castlingCoords).not.toContain(c1);
  });
});