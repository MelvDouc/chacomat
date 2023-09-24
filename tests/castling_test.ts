import Color from "@/base/Color.ts";
import Chess960CastlingRights from "@/variants/chess960/Chess960CastlingRights.ts";
import Chess960Game from "@/variants/chess960/Chess960Game.ts";
import CastlingRights from "@/variants/standard/CastlingRights.ts";
import Position from "@/variants/standard/Position.ts";
import { assert, assertArrayIncludes, assertEquals, assertFalse } from "@dev_deps";

Deno.test("castling rights from string", () => {
  const castlingRights = CastlingRights.fromString("kqKQ", 8);
  assertEquals(castlingRights.toString(8, 8), "kqKQ");
});

Deno.test("castling rights from string - dash", () => {
  const castlingRights = CastlingRights.fromString("-", 8);
  assertEquals(castlingRights.toString(8, 8), "-");
});

Deno.test("castling rights from string - chess960", () => {
  const castlingRights = Chess960CastlingRights.fromString("-");
  assertEquals(castlingRights.toString(), "-");
});

Deno.test("castling rights to string", () => {
  const castlingRights = new CastlingRights();
  castlingRights.get(Color.WHITE).add(0);
  castlingRights.get(Color.WHITE).add(7);
  castlingRights.get(Color.BLACK).add(7);
  assertEquals(castlingRights.toString(8, 8), "kKQ");
});

Deno.test("castling rights to string - chess960", () => {
  const castlingRights = new Chess960CastlingRights();
  castlingRights.get(Color.WHITE).add(1);
  castlingRights.get(Color.WHITE).add(4);
  castlingRights.get(Color.BLACK).add(4);
  assertEquals(castlingRights.toString(), "eBE");
});

Deno.test("castling possible", () => {
  const position = Position.new("4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1");
  assertArrayIncludes(
    position.legalMovesAsAlgebraicNotation,
    ["0-0", "0-0-0"]
  );
});

Deno.test("castling queen side with b1 controlled", () => {
  const position = Position.new("1r2k3/8/8/8/8/8/8/R3K2R w KQ - 0 1");
  assertArrayIncludes(
    position.legalMovesAsAlgebraicNotation,
    ["0-0", "0-0-0"]
  );
});

Deno.test("castling queen side with c1 controlled", () => {
  const position = Position.new("2r1k3/8/8/8/8/8/8/R3K2R w KQ - 0 1");
  assertFalse(position.legalMovesAsAlgebraicNotation.includes("0-0-0"));
});

Deno.test("Pieces should be on the right squares after castling", () => {
  const game = new Chess960Game({ pgn: `[FEN "6k1/8/8/8/8/8/8/2R3KR w CH - 0 1"]` });
  game.playMoveWithNotation("g1c1");
  assert(game.currentPosition.board.at(7, 2)?.isKing());
  assert(game.currentPosition.board.at(7, 3)?.isRook());
  game.goBack();
  game.playMoveWithNotation("g1h1");
  assert(game.currentPosition.board.at(7, 6)?.isKing());
  assert(game.currentPosition.board.at(7, 5)?.isRook());
});