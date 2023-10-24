import { Board, CastlingRights, Color, Pieces, Position, coords } from "../mod.ts";
import { assert, assertEquals, assertFalse } from "./test.index.ts";

Deno.test("parse from string", () => {
  const pos = Position.fromFEN("8/1k6/8/8/5P2/K7/8/8 b - f3 44 78");
  assertEquals(pos.activeColor, Color.BLACK);
  assertEquals(pos.board.pieces.size, 3);
  assertEquals(pos.enPassantCoords, coords[5][5]);
  assertEquals(pos.halfMoveClock, 44);
  assertEquals(pos.fullMoveNumber, 78);
});

Deno.test("check", () => {
  const pos = Position.fromFEN("r3r3/pp3R1p/2n4k/5Bp1/2Q1p3/1P3qP1/P5KP/2B5 w - - 8 30");
  assert(pos.isCheck());
});

Deno.test("checkmate - fool's mate", () => {
  const pos = Position.fromFEN("rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3");
  assert(pos.isCheckmate());
});

Deno.test("checkmate - smothered mate", () => {
  const pos = Position.fromFEN("6rk/5Npp/8/8/8/8/6K1/8 b - - 0 1");
  assert(pos.isCheckmate());
});

Deno.test("checkmate - B+N mate", () => {
  const pos = Position.fromFEN("8/8/8/8/8/2n5/1bk5/K7 w - - 0 1");
  assert(pos.isCheckmate());
});

Deno.test("stalemate", () => {
  const pos = Position.fromFEN("5bnr/4p1pq/4Qpkr/7p/7P/4P3/PPPP1PP1/RNB1KBNR b KQ - 2 10");
  assert(pos.isStalemate());
});

Deno.test("insufficient material - kings only", () => {
  const pos = new Position(new Board(), Color.WHITE, new CastlingRights(), null, 1, 0);
  pos.board.set(coords[0][0], Pieces.WHITE_KING);
  pos.board.set(coords[7][7], Pieces.BLACK_KING);
  assert(pos.isInsufficientMaterial());
});

Deno.test("insufficient material - minor piece only", () => {
  assert(Position.fromFEN("k7/8/8/8/8/8/8/6BK w - - 0 1").isInsufficientMaterial());
  assert(Position.fromFEN("kn6/8/8/8/8/8/8/7K b - - 0 1").isInsufficientMaterial());
});

Deno.test("insufficient material - same-colored bishops", () => {
  assert(Position.fromFEN("kb6/8/8/8/8/8/8/BK6 w - - 0 1").isInsufficientMaterial());
});

Deno.test("sufficient material - opposite-colored bishops", () => {
  assertFalse(Position.fromFEN("kb6/8/8/8/8/8/8/KB6 w - - 0 1").isInsufficientMaterial());
});