import Colors from "$src/constants/Colors";
import SquareIndex from "$src/constants/SquareIndex";
import Board from "$src/game/Board";
import CastlingRights from "$src/game/CastlingRights";
import Position from "$src/game/Position";
import Pieces from "$src/pieces/Pieces";
import { expect, test } from "bun:test";

test("parse from string", () => {
  const pos = Position.fromFEN("8/1k6/8/8/5P2/K7/8/8 b - f3 44 78");
  expect(pos.activeColor).toEqual(Colors.BLACK);
  expect(pos.board.pieceCount).toEqual(3);
  expect(pos.enPassantIndex).toEqual(SquareIndex.f3);
  expect(pos.halfMoveClock).toEqual(44);
  expect(pos.fullMoveNumber).toEqual(78);
});

test("check 1", () => {
  const pos = Position.fromFEN("rnbqk1nr/pppp1ppp/4p3/8/1bPP4/8/PP2PPPP/RNBQKBNR w KQkq - 1 3");
  expect(pos.isCheck()).toBeTrue();
});

test("check 2", () => {
  const pos = Position.fromFEN("r3r3/pp3R1p/2n4k/5Bp1/2Q1p3/1P3qP1/P5KP/2B5 w - - 8 30");
  expect(pos.isCheck()).toBeTrue();
});

test("checkmate - fool's mate", () => {
  const pos = Position.fromFEN("rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3");
  expect(pos.isCheckmate()).toBeTrue();
});

test("checkmate - smothered mate", () => {
  const pos = Position.fromFEN("6rk/5Npp/8/8/8/8/6K1/8 b - - 0 1");
  expect(pos.isCheckmate()).toBeTrue();
});

test("checkmate - B+N mate", () => {
  const pos = Position.fromFEN("8/8/8/8/8/2n5/1bk5/K7 w - - 0 1");
  expect(pos.isCheckmate()).toBeTrue();
});

test("stalemate", () => {
  const pos = Position.fromFEN("5bnr/4p1pq/4Qpkr/7p/7P/4P3/PPPP1PP1/RNB1KBNR b KQ - 2 10");
  expect(pos.isStalemate()).toBeTrue();
});

test("insufficient material - kings only", () => {
  const pos = new Position(
    new Board(),
    Colors.WHITE,
    new CastlingRights(),
    null,
    1,
    0
  );
  pos.board.set(SquareIndex.e1, Pieces.WHITE_KING);
  pos.board.set(SquareIndex.e8, Pieces.BLACK_KING);
  expect(pos.isInsufficientMaterial()).toBeTrue();
});

test("insufficient material - minor piece only", () => {
  expect(Position.fromFEN("k7/8/8/8/8/8/8/6BK w - - 0 1").isInsufficientMaterial()).toBeTrue();
  expect(Position.fromFEN("kn6/8/8/8/8/8/8/7K b - - 0 1").isInsufficientMaterial()).toBeTrue();
});

test("insufficient material - same-colored bishops", () => {
  expect(Position.fromFEN("kb6/8/8/8/8/8/8/BK6 w - - 0 1").isInsufficientMaterial()).toBeTrue();
});

test("sufficient material - opposite-colored bishops", () => {
  expect(Position.fromFEN("kb6/8/8/8/8/8/8/KB6 w - - 0 1").isInsufficientMaterial()).toBeFalse();
});

test("reversed position", () => {
  const pos = Position.fromFEN("rn1qkbnr/1bppp1pp/8/pP6/4PpP1/8/PP1PKP1P/RNBQ1BNR b kq g3 0 6");
  const reversed = pos.reverse();
  expect(pos.activeColor).toBe(reversed.inactiveColor);
  expect(reversed.castlingRights.toString()).toBe(pos.castlingRights.toString().toUpperCase());
  expect(reversed.board.pieceCount).toBe(pos.board.pieceCount);
  expect(reversed.enPassantIndex).toBe(SquareIndex.g6);
  expect(reversed.halfMoveClock).toBe(pos.halfMoveClock);
  expect(reversed.fullMoveNumber).toBe(pos.fullMoveNumber);
});