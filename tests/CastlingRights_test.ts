import { CastlingRights, ChessGame, Color } from "../mod.ts";
import { assert, assertEquals, assertFalse } from "./test.index.ts";

Deno.test("from and to string", () => {
  const castlingStr = "kqKQ";
  assertEquals(CastlingRights.fromString(castlingStr).toString(), castlingStr);
  assertEquals((new CastlingRights()).toString(), "-");
});

Deno.test("cloning", () => {
  const castlingRights = new CastlingRights();
  castlingRights.get(Color.WHITE).add(7);
  castlingRights.get(Color.WHITE).add(0);
  castlingRights.get(Color.BLACK).add(0);
  const clone = castlingRights.clone();

  for (const color of Color.cases()) {
    const cr1 = castlingRights.get(color);
    const cr2 = clone.get(color);
    if (cr1.size !== cr2.size)
      assert(false);
  }
});

Deno.test("Castling rights should be unset on king move.", () => {
  const game = new ChessGame({
    info: { Result: "*", FEN: "1k6/8/8/8/8/8/8/R3K2R w KQ 0 1" },
    moveString: ""
  });
  game.playMoveWithNotation("e1g1");
  assertEquals(game.currentPosition.castlingRights.get(Color.WHITE).size, 0);
});

Deno.test("Castling right should be unset on rook move and enemy rook capture.", () => {
  const game = new ChessGame({
    info: { Result: "*", FEN: "r2nk2r/8/8/8/8/8/8/R3K2R w kqKQ 0 1" },
    moveString: ""
  });
  game.playMoveWithNotation("a1a8");
  const whiteCastlingRights = game.currentPosition.castlingRights.get(Color.WHITE);
  const blackCastlingRights = game.currentPosition.castlingRights.get(Color.BLACK);

  assertFalse(whiteCastlingRights.has(0));
  assert(whiteCastlingRights.has(7));
  assertFalse(blackCastlingRights.has(0));
  assert(blackCastlingRights.has(7));
});