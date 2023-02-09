import ChessGame from "@chacomat/game/ChessGame.js";
import Piece, { Knight, Pawn } from "@chacomat/pieces/index.js";

describe("Piece", () => {
  it("n should be a black knight", () => {
    const piece = new Knight("BLACK");

    expect(piece.color).toBe("BLACK");
    expect(piece.pieceName).toBe("Knight");
  });

  it("P should be a white pawn", () => {
    const piece = new (Piece.pieceClassesByInitial.get("P") as typeof Pawn)("WHITE");

    expect(piece.color).toBe("WHITE");
    expect(piece.pieceName).toBe("Pawn");
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
    expect([...whiteKing.castlingCoords(false)]).not.toContain(58 /* c1 */);
  });
});