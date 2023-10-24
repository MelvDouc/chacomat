import Coords, { coords } from "@/board/Coords.ts";
import { assert, assertEquals, assertFalse, assertNullish } from "./test.index.ts";

Deno.test("coords safety", () => {
  assert(Coords.isSafe(4, 4));
  assertFalse(Coords.isSafe(0, 8));
});

Deno.test("conversion from coords", () => {
  assertEquals(Coords.xToFileName(0), "a");
  assertEquals(Coords.xToFileName(7), "h");
  assertEquals(Coords.yToRankName(0), "8");
  assertEquals(Coords.yToRankName(7), "1");
  assertEquals(coords[4][4].notation, "e4");
});

Deno.test("conversion to coords", () => {
  assertEquals(Coords.rankNameToY("5"), 3);
  assertEquals(Coords.fileNameToX("g"), 6);
  assertEquals(Coords.fromNotation("g7"), coords[6][1]);
  assertNullish(Coords.fromNotation("-"));
});

Deno.test("square lightness", () => {
  assert(coords[0][0].isLightSquare());
  assertFalse(coords[0][7].isLightSquare());
});