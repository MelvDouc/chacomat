import ChessGame from "@chacomat/game/ChessGame.js";
import Coords from "@chacomat/game/Coords.js";

const c1 = Coords.fromNotation("c1")!;

describe("A king", () => {
  it("should be able to castle with no squares between it and a rook", () => {
    const game = new ChessGame({
      fenString: "4k3/8/8/8/8/8/8/R3KBNR w KQ - 0 1"
    });
    const { legalMovesAsNotation } = game.currentPosition;

    expect(legalMovesAsNotation).toContain("e1-c1");
    expect(legalMovesAsNotation).not.toContain("e1-g1");
  });

  it("should not be able to castle through check", () => {
    const game = new ChessGame({
      fenString: "2r1k3/8/8/8/8/8/8/R3KBNR w KQ - 0 1"
    });
    const whiteKing = game.currentPosition.board.kings[ChessGame.Colors.WHITE];
    const castlingCoords = [
      ...whiteKing.castlingCoords()
    ];

    expect(castlingCoords).not.toContain(c1);
  });
});