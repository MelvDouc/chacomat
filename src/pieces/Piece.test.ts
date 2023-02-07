import ChessGame from "@chacomat/game/ChessGame.js";
import Piece from "@chacomat/pieces/Piece.js";

describe("Piece", () => {
  it("n should be a black knight", () => {
    const piece = Piece.fromInitial("n");

    expect(piece.#color).toBe("BLACK");
    expect(piece.isKnight()).toBe(true);
  });

  it("P should be a white pawn", () => {
    const piece = Piece.fromInitial("P");

    expect(piece.#color).toBe("WHITE");
    expect(piece.isPawn()).toBe(true);
  });

  it("Q should produce a queen", () => {
    const pawn = new Piece({ color: "WHITE", type: "P" });
    pawn.type = "Q";

    expect(pawn.isQueen()).toBe(true);
  });
});

describe("A king", () => {
  it("should be able to castle with no squares between it and a rook", () => {
    const { currentPosition } = new ChessGame({
      fen: "4k3/8/8/8/8/8/8/R3KBNR w KQ - 0 1"
    });
    const { legalMovesAsNotation } = currentPosition;

    expect(legalMovesAsNotation).toContain("e1-c1");
    expect(legalMovesAsNotation).not.toContain("e1-g1");
  });

  it("should not be able to castle through check", () => {
    const game = new ChessGame({
      fen: "2r1k3/8/8/8/8/8/8/R3KBNR w KQ - 0 1"
    });
    const whiteKing = game.currentPosition.board.kings["WHITE"];
    const castlingCoords = [
      ...Piece.castlingCoords(whiteKing, false)
    ];

    expect(castlingCoords).not.toContain(58 /* c1 */);
  });
});