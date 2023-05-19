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

  it("should print variations", () => {
    const game = new ChessGame();
    const posAfterPe4 = game.playMoveWithNotations("e2", "e4").currentPosition;
    game
      .playMoveWithNotations("e7", "e5")
      .playMoveWithNotations("g1", "f3")
      .playMoveWithNotations("b8", "c6")
      .playMoveWithNotations("f1", "b5")
      .playMoveWithNotations("a7", "a6");

    game.currentPosition = posAfterPe4;
    game.playMoveWithNotations("c7", "c5");
    game.playMoveWithNotations("f2", "f4");
    const e6SicilianPos = game.playMoveWithNotations("e7", "e6").currentPosition;

    game.currentPosition = posAfterPe4;
    game.playMoveWithNotations("c7", "c6");

    game.currentPosition = e6SicilianPos;
    game.playMoveWithNotations("b1", "c3");

    const pgn = game.toString();
    console.log(pgn);
    assert(pgn.includes("1... c5 2. f4 e6 3. Nc3"));
  });
});