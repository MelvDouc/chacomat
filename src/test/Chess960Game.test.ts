import Chess960Game from "@src/variants/chess960/Chess960Game.js";
import assert from "node:assert";
import { describe, it } from "node:test";

describe("A chess960 game", () => {
  it("should be stringifiable", () => {
    const fen = "rkrbbnnq/pppppppp/8/8/8/8/PPPPPPPP/RKRBBNNQ w ACac - 0 1";
    const game = new Chess960Game({ fen });
    assert(game.currentPosition.toString() === fen, game.currentPosition.toString());
  });
});
