import Color from "../constants/Color.js";
import Wing from "../constants/Wing.js";
import { assertStrictEquals } from "../test-utils.js";
import CastlingRights from "./CastlingRights.js";

Deno.test("castling: string to object", () => {
  const castlingRights = CastlingRights.fromString("KQk");

  assertStrictEquals(castlingRights[Color.WHITE][Wing.KING_SIDE], true);
  assertStrictEquals(castlingRights[Color.WHITE][Wing.QUEEN_SIDE], true);
  assertStrictEquals(castlingRights[Color.BLACK][Wing.QUEEN_SIDE], false);
  assertStrictEquals(castlingRights[Color.BLACK][Wing.KING_SIDE], true);
});

Deno.test("castling: object to string", () => {
  const castlingRights = CastlingRights();
  castlingRights[Color.WHITE][Wing.QUEEN_SIDE] = false;

  assertStrictEquals(castlingRights.toString(), "Kkq");
});
