import { strict, strictEqual } from "node:assert";
import { test } from "node:test";
import Piece from "../dist/constants/Piece.js";
import ChessGame from "../dist/game/ChessGame.js";
import Coords from "../dist/game/Coords.js";
import Move from "../dist/moves/Move.js";

test("entering moves #1", () => {
  const game = new ChessGame();
  game.playMove(new Move(Coords.get(6, 4), Coords.get(4, 4)));
  const { board } = game.currentPosition;

  strict(!board.has(Coords.get(6, 4)));
  strictEqual(board.get(Coords.get(4, 4)), Piece.WHITE_PAWN);
});

test("entering moves #2", () => {
  const game = new ChessGame();
  game
    .playMove(new Move(Coords.get(6, 4), Coords.get(4, 4)))
    .playMove(new Move(Coords.get(1, 3), Coords.get(3, 3)))
    .playMove(new Move(Coords.get(4, 4), Coords.get(3, 3)));
  const { board } = game.currentPosition;

  strict(!board.has(Coords.get(4, 4)));
  strictEqual(board.get(Coords.get(3, 3)), Piece.WHITE_PAWN);
});

test("parse game info", () => {
  const game = new ChessGame({ pgn: `[Result "*"][White "Fischer, Bobby"]` });
  strictEqual(game.metaData.Result, ChessGame.Result.NONE);
  strictEqual(game.metaData.White, "Fischer, Bobby");
});

test("entering moves via a PGN", () => {
  const game = new ChessGame({ pgn: `1. e4` });
  strictEqual(game.currentPosition.activeColor.abbreviation, "b");
});