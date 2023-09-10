import { coordsToIndex, indexToCoords, indexToNotation, notationToIndex } from "@/base/CoordsUtils.ts";
import { assertEquals } from "@dev_deps";

Deno.test("coords to index", () => {
  assertEquals(coordsToIndex({ x: 4, y: 4 }, 8), 36);
});

Deno.test("index to coords", () => {
  const { x, y } = indexToCoords(36, 8);
  assertEquals(x, 4);
  assertEquals(y, 4);
});

Deno.test("notation to index", () => {
  assertEquals(notationToIndex("f3", 8), 45);
});

Deno.test("index to notation", () => {
  assertEquals(indexToNotation(45, 8), "f3");
});