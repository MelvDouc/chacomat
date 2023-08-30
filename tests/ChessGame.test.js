import Piece from "../dist/constants/Piece.js";
import ChessGame from "../dist/game/ChessGame.js";
import Coords from "../dist/game/Coords.js";
import Move from "../dist/moves/Move.js";
import { expect, test } from "./utils.js";

test("entering moves #1", () => {
  const game = new ChessGame();
  game.playMove(new Move(Coords.get(6, 4), Coords.get(4, 4)));
  const { board } = game.currentPosition;

  expect(board.has(Coords.get(6, 4))).false();
  expect(board.get(Coords.get(4, 4))).toBe(Piece.WHITE_PAWN);
});

test("entering moves #2", () => {
  const game = new ChessGame();
  game
    .playMove(new Move(Coords.get(6, 4), Coords.get(4, 4)))
    .playMove(new Move(Coords.get(1, 3), Coords.get(3, 3)))
    .playMove(new Move(Coords.get(4, 4), Coords.get(3, 3)));
  const { board } = game.currentPosition;

  expect(board.has(Coords.get(4, 4))).false();
  expect(board.get(Coords.get(3, 3))).toBe(Piece.WHITE_PAWN);
});