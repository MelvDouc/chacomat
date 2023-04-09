import ChessGame from "@src/game/ChessGame.js";
import GameStatus, { GameResults } from "@src/constants/GameStatus.js";

describe("Various checkmates", () => {
  it("fool's mate", () => {
    const game = new ChessGame({
      pgn: "1. f3 e5 2. g4 Qh4#"
    });
    expect(game.getResult()).toBe(GameResults.BLACK_WIN);
  });

  it("scholar's mate", () => {
    const game = new ChessGame({
      pgn: "1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#"
    });
    expect(game.getCurrentPosition().getStatus()).toBe(GameStatus.CHECKMATE);
  });

  it("the Opera Game", () => {
    const game = new ChessGame({
      pgn: `
        [Site "Paris FRA"]
        [Date "1858.??.??"]
        [Result "1-0"]
        [White "Paul Morphy"]
        [Black "Duke Karl / Count Isouard"]

        1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7
        8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8
        13.Rxd7 Rxd7 14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8# 1-0
      `
    });
    expect(game.getCurrentPosition().getStatus()).toBe(GameStatus.CHECKMATE);
  });
});