import Color from "$src/constants/Color.js";
import CastlingRights from "$src/game/CastlingRights.js";
import ChessGame from "$src/game/ChessGame.js";
import { expect } from "expect";
import { test } from "node:test";

test("from and to string", () => {
  expect((new CastlingRights()).toString()).toEqual("kqKQ");
  expect(CastlingRights.fromString("-").toString()).toEqual("-");
});

test("cloning", () => {
  const castlingRights = new CastlingRights();
  const { white, black } = castlingRights;
  white.queenSide = false;
  black.kingSide = false;
  const clone = castlingRights.clone();

  expect(white.queenSide).toEqual(clone.white.queenSide);
  expect(black.queenSide).toEqual(clone.black.queenSide);
  expect(white.kingSide).toEqual(clone.white.kingSide);
  expect(black.kingSide).toEqual(clone.black.kingSide);
});

test("Castling rights should be unset on king move.", () => {
  const game = new ChessGame({
    info: {
      Result: "*",
      FEN: "1k6/8/8/8/8/8/8/R3K2R w KQ 0 1"
    }
  });
  game.playMoveWithNotation("e1g1");
  const { castlingRights } = game.currentPosition;
  expect(castlingRights.white.queenSide).toBe(false);
  expect(castlingRights.white.kingSide).toBe(false);
});

test("Castling right should be unset on rook move and enemy rook capture.", () => {
  const game = new ChessGame({
    info: {
      Result: "*",
      FEN: "r2nk2r/8/8/8/8/8/8/R3K2R w kqKQ 0 1"
    }
  });
  game.playMoveWithNotation("a1a8");
  const { castlingRights } = game.currentPosition;
  expect(castlingRights.white.queenSide).toBe(false);
  expect(castlingRights.black.queenSide).toBe(false);
  expect(castlingRights.white.kingSide).toBe(true);
  expect(castlingRights.black.kingSide).toBe(true);
});