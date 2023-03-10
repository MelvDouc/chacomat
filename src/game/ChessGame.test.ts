import ChessGame from "@chacomat/game/ChessGame.js";
import Coords from "@chacomat/utils/Coords.js";

describe("Fool's Mate", () => {
  const game = new ChessGame();
  game.moveWithNotations("f2", "f3");
  game.moveWithNotations("e7", "e6");
  game.moveWithNotations("g2", "g4");
  game.moveWithNotations("d8", "h4");

  it("should be check", () => {
    expect(game.currentPosition.isCheck()).toBe(true);
  });

  it("should be checkmate", () => {
    expect(game.status).toBe(ChessGame.statuses.CHECKMATE);
  });
});

describe("en passant", () => {
  const game1 = new ChessGame();
  game1.moveWithNotations("e2", "e4");
  game1.moveWithNotations("d7", "d5");
  game1.moveWithNotations("e4", "d5");
  game1.moveWithNotations("e7", "e5");

  it("#1", () => {
    expect(game1.currentPosition.board.enPassantY).toBe(4);
  });

  it("#2", () => {
    expect(game1.currentPosition.legalMovesAsNotation).toContain("d5-e6");
  });

  it("the 'ep' pawn should be removed", () => {
    let game = new ChessGame()
      .moveWithNotations("e2", "e4")
      .moveWithNotations("e7", "e5")
      .moveWithNotations("d2", "d4")
      .moveWithNotations("e5", "d4")
      .moveWithNotations("c2", "c4");
    game = game.moveWithNotations("d4", "c3");

    expect(game.currentPosition.board.get(Coords.fromNotation("c4"))).toBeFalsy();
    expect(game.currentPosition.board.get(Coords.fromNotation("d4"))).toBeFalsy();
    expect(game.currentPosition.board.get(Coords.fromNotation("c3"))?.isPawn()).toBe(true);
  });
});

describe("Stalemate", () => {
  it("should occur in this composition", () => {
    const game = new ChessGame({
      fen: "5bnr/4p1pq/4Qpkr/7p/7P/4P3/PPPP1PP1/RNB1KBNR b KQ - 2 10"
    });

    expect(game.status).toBe(ChessGame.statuses.STALEMATE);
  });

  it("should be possible after a promotion", () => {
    const fen = "8/k1P5/2K5/8/8/8/8/8 w - - 0 1";
    const game = new ChessGame({ fen }).moveWithNotations("c7", "c8", "Q");

    expect(game.status).toBe(ChessGame.statuses.STALEMATE);
  });
});

describe("The goToMove() method", () => {
  const game = new ChessGame();
  const startPos = game.currentPosition;
  game
    .moveWithNotations("d2", "d4")
    .moveWithNotations("g8", "f6")
    .moveWithNotations("c2", "c4")
    .moveWithNotations("e7", "e6");
  const posAfterNc3 = game.moveWithNotations("b1", "c3").currentPosition;

  it("should work backwards", () => {
    game.goToMove(1);
    const posAtMove1 = game.currentPosition;
    expect(posAfterNc3 === posAtMove1).not.toBe(true);
    expect(posAtMove1).toBe(startPos);
  });

  it("should work forwards", () => {
    game.goToMove(3, "BLACK");
    expect(game.currentPosition).toBe(posAfterNc3);
  });
});

describe("full games", () => {
  it("The Opera game", () => {
    const game = new ChessGame();

    game.moveWithNotations("e2", "e4");
    game
      .moveWithNotations("e7", "e5")
      .moveWithNotations("g1", "f3")
      .moveWithNotations("d7", "d6")
      .moveWithNotations("d2", "d4")
      .moveWithNotations("c8", "g4")
      .moveWithNotations("d4", "e5")
      .moveWithNotations("g4", "f3")
      .moveWithNotations("d1", "f3")
      .moveWithNotations("d6", "e5")
      .moveWithNotations("f1", "c4")
      .moveWithNotations("g8", "f6")
      .moveWithNotations("f3", "b3")
      .moveWithNotations("d8", "e7")
      .moveWithNotations("b1", "c3")
      .moveWithNotations("c7", "c6")
      .moveWithNotations("c1", "g5")
      .moveWithNotations("b7", "b5")
      .moveWithNotations("c3", "b5")
      .moveWithNotations("c6", "b5")
      .moveWithNotations("c4", "b5")
      .moveWithNotations("b8", "d7")
      .moveWithNotations("e1", "c1")
      .moveWithNotations("a8", "d8")
      .moveWithNotations("d1", "d7")
      .moveWithNotations("d8", "d7")
      .moveWithNotations("h1", "d1")
      .moveWithNotations("e7", "e6")
      .moveWithNotations("b5", "d7")
      .moveWithNotations("f6", "d7")
      .moveWithNotations("b3", "b8")
      .moveWithNotations("d7", "b8")
      .moveWithNotations("d1", "d8");

    expect(game.status).toBe(ChessGame.statuses.CHECKMATE);
  });
});