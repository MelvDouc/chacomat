import { Color } from "../mod.ts";
import { assertEquals } from "./test.index.ts";

Deno.test("Get color from direction.", () => {
  assertEquals(Color.fromDirection(-1), Color.WHITE);
  assertEquals(Color.fromDirection(1), Color.BLACK);
});

Deno.test("Get color from abbreviation.", () => {
  assertEquals(Color.fromAbbreviation("w"), Color.WHITE);
  assertEquals(Color.fromAbbreviation("b"), Color.BLACK);
});

Deno.test("Get color from name.", () => {
  assertEquals(Color.fromName("white"), Color.WHITE);
  assertEquals(Color.fromName("black"), Color.BLACK);
});

Deno.test("Get color opposite.", () => {
  assertEquals(Color.WHITE.opposite, Color.BLACK);
  assertEquals(Color.BLACK.opposite, Color.WHITE);
});

Deno.test("ranks", () => {
  assertEquals(Color.WHITE.pieceRank, 7);
  assertEquals(Color.BLACK.pieceRank, 0);
  assertEquals(Color.WHITE.pawnRank, 6);
  assertEquals(Color.BLACK.pawnRank, 1);
});