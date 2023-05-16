import ChessGame from "@src/game/ChessGame.js";
import assert from "node:assert";
import { describe, it } from "node:test";

describe("PGN", () => {
  it("should recognize ambiguous moves", () => {
    // w: Ka1, Qf5, Qd3, Qf3; b: Kg1
    const game = new ChessGame({
      fen: "K7/8/8/3p1Q2/8/3Q1Q2/8/6k1 w - - 0 1"
    });
    game.playMoveWithNotations("f3", "d5");
    assert(game.toString().includes("f3-d5"));
  });
});