import Color from "@constants/Color.js";
import Piece from "@constants/Piece.js";
import Wing from "@constants/Wing.js";
import Board from "@game/Board.js";
import Coords from "@game/Coords.js";
import { strict, strictEqual } from "node:assert";
import { test } from "node:test";

test("king coords", () => {
  const board = new Board();
  board.set(Coords.get(0, 0), Piece.WHITE_KING);

  strictEqual(board.getKingCoords(Color.WHITE), Coords.get(0, 0));
});

test("pieces of color", () => {
  const board = new Board();
  board.set(Coords.get(0, 0), Piece.BLACK_KING);
  board.set(Coords.get(0, 1), Piece.BLACK_ROOK);
  board.set(Coords.get(0, 2), Piece.WHITE_KING);
  board.set(Coords.get(0, 3), Piece.BLACK_QUEEN);

  strict([...board.getPiecesOfColor(Color.BLACK)].every(([, piece]) => piece.color === Color.BLACK));
});

test("castling possible", () => {
  const board = new Board();
  board.set(Coords.get(7, 0), Piece.WHITE_ROOK);
  board.set(Coords.get(7, 4), Piece.WHITE_KING);
  board.set(Coords.get(7, 6), Piece.WHITE_KNIGHT);
  board.set(Coords.get(7, 7), Piece.WHITE_ROOK);

  strict(board.canCastleToWing(Wing.QUEEN_SIDE, 0, Color.WHITE, new Set()));
});

test("castling obstructed", () => {
  const board = new Board();
  board.set(Coords.get(7, 0), Piece.WHITE_ROOK);
  board.set(Coords.get(7, 4), Piece.WHITE_KING);
  board.set(Coords.get(7, 6), Piece.WHITE_KNIGHT);
  board.set(Coords.get(7, 7), Piece.WHITE_ROOK);

  strict(!board.canCastleToWing(Wing.KING_SIDE, 7, Color.WHITE, new Set()));
});

test("castling through check", () => {
  const board = new Board();
  board.set(Coords.get(7, 0), Piece.WHITE_ROOK);
  board.set(Coords.get(7, 4), Piece.WHITE_KING);
  board.set(Coords.get(7, 7), Piece.WHITE_ROOK);
  const attackedCoordsSet = new Set([Coords.get(7, 6)]);

  strict(!board.canCastleToWing(Wing.KING_SIDE, 7, Color.WHITE, attackedCoordsSet));
});

test("forward pawn coords #1", () => {
  const board = new Board();
  board.set(Coords.get(6, 0), Piece.WHITE_PAWN);
  const forwardCoords = [...board.forwardPawnCoords(Color.WHITE, Coords.get(6, 0))];

  strict(forwardCoords.includes(Coords.get(5, 0)));
  strict(forwardCoords.includes(Coords.get(4, 0)));
});

test("forward pawn coords #2", () => {
  const board = new Board();
  board.set(Coords.get(6, 0), Piece.WHITE_PAWN);
  board.set(Coords.get(4, 0), Piece.BLACK_PAWN);
  const forwardCoords = [...board.forwardPawnCoords(Color.WHITE, Coords.get(6, 0))];

  strict(forwardCoords.includes(Coords.get(5, 0)));
  strict(!forwardCoords.includes(Coords.get(4, 0)));
});

test("clone", () => {
  const board = new Board();
  board.set(Coords.get(7, 0), Piece.WHITE_ROOK);
  board.set(Coords.get(7, 4), Piece.WHITE_KING);
  board.set(Coords.get(7, 7), Piece.WHITE_ROOK);

  strictEqual(board.toString(), board.clone().toString());
});

test("stringify", () => {
  const boardStr = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";
  const board = Board.fromString(boardStr);
  strictEqual(board.toString(), boardStr, `${boardStr} -> ${board.toString()}`);
});