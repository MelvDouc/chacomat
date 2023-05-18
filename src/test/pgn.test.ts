import ChessGame from "@src/game/ChessGame.js";
import assert from "node:assert";
import { describe, it } from "node:test";

describe("PGN", () => {
  // w: Ka1, Qf5, Qd3, Qf3; b: Kg1, Pd5
  const fen = "K7/8/8/3p1Q2/8/3Q1Q2/8/6k1 w - - 0 1";

  it("should recognize an ambiguous file", () => {
    const game = new ChessGame({ fen });
    game.playMoveWithNotations("d3", "d5");
    assert(game.toString().includes("Qdxd5"));
  });

  it("should recognize an ambiguous rank", () => {
    const game = new ChessGame({ fen });
    game.playMoveWithNotations("f5", "d5");
    assert(game.toString().includes("Q5xd5"));
  });

  it("should recognize an ambiguous file and rank", () => {
    const game = new ChessGame({ fen });
    game.playMoveWithNotations("f3", "d5");
    assert(game.toString().includes("Qf3xd5"));
  });

  it("should print variations", () => {
    const game = new ChessGame();
    game.playMoveWithNotations("e2", "e4");
    game.playMoveWithNotations("e7", "e5");
    game.goToMove(1, -1);
    // console.log(game.currentPosition.legalMovesAsNotations.join(" "));
    game.playMoveWithNotations("c7", "c5");
    console.log(game.toString());
    assert(true);
  });
});