import GameStatus, { GameResults } from "@src/constants/GameStatus.js";
import ChessGame from "@src/game/ChessGame.js";
import assert from "node:assert";
// import { writeFileSync } from "node:fs";
import { describe, it } from "node:test";

describe("A chess game", () => {
  it("should keep track of variations", () => {
    const game = new ChessGame();
    const posAfterPe4 = game.playMoveWithNotations("e2", "e4").currentPosition;
    const posAfterPe5 = game.playMoveWithNotations("e7", "e5").currentPosition;

    game.playMoveWithNotations("g1", "f3")
      .playMoveWithNotations("b8", "c6")
      .playMoveWithNotations("f1", "b5")
      .playMoveWithNotations("a7", "a6");

    game.currentPosition = posAfterPe4;
    const sicilianPos = game.playMoveWithNotations("c7", "c5").currentPosition;

    game.currentPosition = posAfterPe4;
    const ckPos = game.playMoveWithNotations("c7", "c6").currentPosition;

    const postE4Positions = posAfterPe4.next.map((x) => x.position);
    assert(postE4Positions[0] === posAfterPe5);
    assert(postE4Positions[1] === sicilianPos);
    assert(postE4Positions[2] === ckPos);
  });
});

describe("Various checkmates", () => {
  it("fool's mate", () => {
    const game = new ChessGame({
      pgn: "1. f3 e5 2. g4 Qh4#"
    });
    assert.strictEqual(game.result, GameResults.BLACK_WIN);
  });

  it("scholar's mate", () => {
    const game = new ChessGame({
      pgn: "1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7#"
    });
    assert.strictEqual(game.currentPosition.status, GameStatus.CHECKMATE);
  });

  it("the Opera Game", () => {
    const game = new ChessGame({
      pgn: `
        [Site "Paris FRA"]
        [Date "1858.??.??"]
        [White "Paul Morphy"]
        [Black "Duke Karl / Count Isouard"]
        [Result "1-0"]

        1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7
        8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8
        13.Rxd7 Rxd7 14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8# 1-0
      `
    });
    // writeFileSync("./pgn/opera-game.pgn", game.toString());
    assert.strictEqual(game.currentPosition.status, GameStatus.CHECKMATE);
  });

  it("Polugaevsky - Nezhmetdinov (1958)", () => {
    const game = new ChessGame({
      pgn: `
        [Site "Sochi URS"]
        [White "Polugaevsky, Lev"]
        [Black "Nezhmetdinov, Rashid"]

        1.d4 Nf6 2.c4 d6 3.Nc3 e5 4.e4 exd4 5.Qxd4 Nc6 6.Qd2 g6 7.b3 Bg7 8.Bb2 0-0 9. Bd3 Ng4 10.Nge2 Qh4 11.Ng3 Nge5 12.0-0 f5 13.f3 Bh6 14.Qd1 f4 15.Nge2 g5 16.Nd5 g4 17.g3 fxg3 18.hxg3 Qh3 19.f4 Be6 20.Bc2 Rf7 21.Kf2 Qh2+ 22.Ke3 Bxd5 23.cxd5 Nb4 24.Rh1 Rxf4 25.Rxh2 Rf3+ 26.Kd4 Bg7 27.a4 c5+ 28.dxc6 bxc6 29.Bd3 Nexd3+ 30.Kc4 d5+ 31.exd5 cxd5+ 32.Kb5 Rb8+ 33.Ka5 Nc6+
      `
    });
    game
      .playMoveWithNotations("a5", "a6")
      .playMoveWithNotations("b8", "b6");
    assert(game.result, "0-1");
    // writeFileSync("./pgn/nezhmetdinov-immortal.pgn", game.toString());
  });
});

describe("Stalemate", () => {
  it("fastest stalemate", () => {
    const game = new ChessGame({
      pgn: `1. e3 a5 2. Qh5 Ra6 3. Qa5 h5 4. Qxc7 Rah6
        5. h4 f6 6. Qxd7+ Kf7 7. Qxb7 Qd3 8. Qxb8 Qh7 9. Qxc8 Kg6 10. Qe6`
    });
    assert(game.currentPosition.status === GameStatus.STALEMATE);
  });
});