import test from "node:test";
import assert from "node:assert";
import Color from "../constants/Color.js";
import Wing from "../constants/Wing.js";
import CastlingRights from "./CastlingRights.js";

test("castling: string to object", () => {
  const castlingRights = CastlingRights.fromString("KQk");

  assert.strictEqual(castlingRights[Color.WHITE][Wing.KING_SIDE], true);
  assert.strictEqual(castlingRights[Color.WHITE][Wing.QUEEN_SIDE], true);
  assert.strictEqual(castlingRights[Color.BLACK][Wing.QUEEN_SIDE], false);
  assert.strictEqual(castlingRights[Color.BLACK][Wing.KING_SIDE], true);
});

test("castling: object to string", () => {
  const castlingRights = CastlingRights();
  castlingRights[Color.WHITE][Wing.QUEEN_SIDE] = false;

  assert.strictEqual(castlingRights.toString(), "Kkq");
});
