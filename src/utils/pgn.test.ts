import ChessGame from "@chacomat/game/ChessGame.js";
import Color from "@chacomat/utils/Color.js";
import Coords from "@chacomat/utils/Coords.js";
import { playMovesFromPgn } from "@chacomat/utils/pgn.js";

describe("PNG reader", () => {
  it("should be able to handle the first few moves", () => {
    const game = new ChessGame();
    playMovesFromPgn("1. e4 e5 2. Nf3 Nc6", game);

    expect(game.currentPosition.toString()).toBe("r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3");
  });

  it("should be able to handle a move with no black half-move", () => {
    const game = new ChessGame();
    playMovesFromPgn("1. Nc3 e6 2. e4 d5 3. exd5", game);

    expect(game.currentPosition.toString()).toBe("rnbqkbnr/ppp2ppp/4p3/3P4/8/2N5/PPPP1PPP/R1BQKBNR b KQkq - 0 3");
  });

  it("should work with an ongoing game", () => {
    const game = new ChessGame();
    game
      .moveWithNotations("c2", "c4")
      .moveWithNotations("b7", "b6")
      .moveWithNotations("e2", "e4")
      .moveWithNotations("c8", "b7");

    playMovesFromPgn("3. Bd3 4. e5 Nf3 5. Bc5", game);

    expect(game.currentPosition.toString()).toBe(`rn1qk1nr/pbpp1ppp/1p6/2b1p3/2P1P3/3B1N2/PP1P1PPP/RNBQK2R w KQkq - 2 5`);
  });
});

describe("An ambiguous move", () => {
  const getGame = () => new ChessGame({
    fenString: "k7/7Q/3R1R2/8/6Q1/8/6K1/3R4 w - - 0 1"
  });
  const d1 = Coords.fromNotation("d1");
  const d4 = Coords.fromNotation("d4");
  const d6 = Coords.fromNotation("d6");
  const e6 = Coords.fromNotation("e6");
  const f6 = Coords.fromNotation("f6");
  const g4 = Coords.fromNotation("g4");
  const g6 = Coords.fromNotation("g6");
  const h7 = Coords.fromNotation("h7");

  it("should be detected on an ambiguous file", () => {
    const game = getGame();
    playMovesFromPgn("1. R6d4", game);

    const { board } = game.currentPosition;

    expect(board.get(d6)).toBeFalsy();
    expect(board.get(d4)?.isRook()).toBe(true);
    expect(board.get(d4)?.color).toBe(Color.WHITE);
    expect(board.get(d1)?.isRook()).toBe(true);
    expect(board.get(d1)?.color).toBe(Color.WHITE);
  });

  it("should be detected on an ambiguous rank", () => {
    const game = getGame();
    playMovesFromPgn("1. Rfe6", game);

    const { board } = game.currentPosition;

    expect(board.get(f6)).toBeFalsy();
    expect(board.get(e6)?.isRook()).toBe(true);
    expect(board.get(e6)?.color).toBe(Color.WHITE);
    expect(board.get(d6)?.isRook()).toBe(true);
    expect(board.get(d6)?.color).toBe(Color.WHITE);
  });

  it("should be detected on an ambiguous square", () => {
    const game = getGame();
    playMovesFromPgn("1. Qh7g6", game);

    const { board } = game.currentPosition;

    expect(board.get(h7)).toBeFalsy();
    expect(board.get(g6)?.isQueen()).toBe(true);
    expect(board.get(g6)?.color).toBe(Color.WHITE);
    expect(board.get(g4)?.isQueen()).toBe(true);
    expect(board.get(g4)?.color).toBe(Color.WHITE);
  });
});

describe("Castling", () => {
  it("should work on both sides", () => {
    const game = new ChessGame({ fenString: `4k2r/8/8/8/8/8/8/R3K3 w Qk - 0 1` });

    expect(() => playMovesFromPgn("1. 0-0-0 0-0", game)).not.toThrowError();
    game.logBoard();
  });
});