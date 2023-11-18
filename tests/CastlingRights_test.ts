import Colors from "$src/constants/Colors";
import CastlingRights from "$src/game/CastlingRights";
import ChessGame from "$src/game/ChessGame";
import { expect, test } from "bun:test";

test("from and to string", () => {
  expect((new CastlingRights()).toString()).toEqual("kqKQ");
  expect(CastlingRights.fromString("-").toString()).toEqual("-");
});

test("cloning", () => {
  const castlingRights = new CastlingRights();
  const { queenSide, kingSide } = castlingRights;
  queenSide[Colors.WHITE] = false;
  kingSide[Colors.BLACK] = false;
  const clone = castlingRights.clone();

  expect(queenSide[Colors.WHITE]).toEqual(clone.queenSide[Colors.WHITE]);
  expect(queenSide[Colors.BLACK]).toEqual(clone.queenSide[Colors.BLACK]);
  expect(kingSide[Colors.WHITE]).toEqual(clone.kingSide[Colors.WHITE]);
  expect(kingSide[Colors.BLACK]).toEqual(clone.kingSide[Colors.BLACK]);
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
  expect(castlingRights.queenSide[Colors.WHITE]).toBeFalse();
  expect(castlingRights.kingSide[Colors.WHITE]).toBeFalse();
});

test("Castling right should be unset on rook move and enemy rook capture.", () => {
  const game = new ChessGame({
    info: {
      Result: "*",
      FEN: "r2nk2r/8/8/8/8/8/8/R3K2R w kqKQ 0 1"
    }
  });
  game.playMoveWithNotation("a1a8");
  const { castlingRights: { queenSide, kingSide } } = game.currentPosition;
  expect(queenSide[Colors.WHITE]).toBeFalse();
  expect(queenSide[Colors.BLACK]).toBeFalse();
  expect(kingSide[Colors.WHITE]).toBeTrue();
  expect(kingSide[Colors.BLACK]).toBeTrue();
});