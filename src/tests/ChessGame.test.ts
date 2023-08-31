import Piece from "@constants/Piece.js";
import ChessGame from "@game/ChessGame.js";
import Coords from "@game/Coords.js";
import Move from "@moves/Move.js";
import { strict, strictEqual } from "node:assert";
import { test } from "node:test";

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

test("entering moves via a PGN", () => {
  const game = new ChessGame({ pgn: `1. e4` });
  strictEqual(game.currentPosition.activeColor.abbreviation, "b");
});