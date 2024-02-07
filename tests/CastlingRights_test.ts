import { CastlingRights, ChessGame } from "$src/index.js";
import { expect } from "chai";
import { describe, it } from "node:test";

describe("CastlingRights", () => {
  it("should be serializable", () => {
    expect(new CastlingRights().toString()).to.equal("kqKQ");
    expect(CastlingRights.fromString("-").toString()).to.equal("-");
  });

  it("should be clonable", () => {
    const castlingRights = new CastlingRights();
    const { white, black } = castlingRights;
    white.queenSide = false;
    black.kingSide = false;
    const clone = castlingRights.clone();

    expect(white.queenSide).to.equal(clone.white.queenSide);
    expect(black.queenSide).to.equal(clone.black.queenSide);
    expect(white.kingSide).to.equal(clone.white.kingSide);
    expect(black.kingSide).to.equal(clone.black.kingSide);
  });

  it("should be unset on king move", () => {
    const game = new ChessGame({
      info: {
        Result: "*",
        FEN: "1k6/8/8/8/8/8/8/R3K2R w KQ - 0 1"
      }
    });
    const move = game.currentPosition.findMoveByComputerNotation("e1g1")!;
    game.playMove(move);
    const { castlingRights } = game.currentPosition;
    expect(castlingRights.white.queenSide, "Can go long.").to.be.false;
    expect(castlingRights.white.kingSide, "Can go short.").to.be.false;
  });

  it("should be unset on rook move and enemy rook capture", () => {
    const game = new ChessGame({
      info: {
        Result: "*",
        FEN: "r2nk2r/8/8/8/8/8/8/R3K2R w kqKQ - 0 1"
      }
    });
    const move = game.currentPosition.findMoveByComputerNotation("a1a8")!;
    game.playMove(move);
    const { castlingRights } = game.currentPosition;
    expect(castlingRights.white.queenSide).to.be.false;
    expect(castlingRights.black.queenSide).to.be.false;
    expect(castlingRights.white.kingSide).to.be.true;
    expect(castlingRights.black.kingSide).to.be.true;
  });
});