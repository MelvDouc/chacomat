import ChessGame from "@src/game/ChessGame.js";
import { Position } from "@src/types.js";
import assert from "node:assert";
import { describe, it } from "node:test";

describe("A PGN", () => {
  // w: Ka1, Qf5, Qd3, Qf3; b: Kg1, Pd5
  const fen = "K7/8/8/3p1Q2/8/3Q1Q2/8/6k1 w - - 0 1";
  const game = new ChessGame({ fen });

  it("should recognize an ambiguous file", () => {
    game.playMoveWithNotations("d3", "d5");
    assert(game.toString().includes("Qdxd5"), game.toString());
  });

  it("should recognize an ambiguous rank", () => {
    game.currentPosition = game.currentPosition.prev as Position;
    game.playMoveWithNotations("f5", "d5");
    assert(game.toString().includes("Q5xd5"), game.toString());
  });

  it("should recognize an ambiguous file and rank", () => {
    game.currentPosition = game.currentPosition.prev as Position;
    game.playMoveWithNotations("f3", "d5");
    assert(game.toString().includes("Qf3xd5"), game.toString());
  });

  it("should parse variations", () => {
    const game = new ChessGame({
      pgn: `1. e4 e5
        ( 1... c5 2. f4 ( 2. Nc3 ) )
        ( 1... c6 )
        2. Nf3 ( 2. Bc4 ) 2... Nc6 3. Bb5 a6
        `
    });

    const pgn = game.toString();
    console.log(pgn);
    assert(pgn.includes("( 1... c6 )"), pgn);
    assert(pgn.includes("1... c5 2. f4 ( 2. Nc3 )"), pgn);
  });
});