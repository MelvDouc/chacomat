import ShatranjBoard from "@/variants/shatranj/ShatranjBoard.ts";
import { assert, assertEquals } from "@dev_deps";

const board = new ShatranjBoard();
const coordsToIndex = board.coordsToIndex.bind(board);
const indexToCoords = board.indexToCoords.bind(board);
const indexToNotation = board.indexToNotation.bind(board);
const notationToIndex = board.notationToIndex.bind(board);

const a8Coords = { x: 0, y: 0 };
const h8Coords = { x: 0, y: 7 };
const e4Coords = { x: 4, y: 4 };
const a1Coords = { x: 7, y: 0 };
const h1Coords = { x: 7, y: 7 };

const a8Index = 0;
const h8Index = 7;
const e4Index = 36;
const a1Index = 56;
const h1Index = 63;

Deno.test("index to coords", () => {
  const a8 = indexToCoords(a8Index);
  const h8 = indexToCoords(h8Index);
  const e4 = indexToCoords(e4Index);
  const a1 = indexToCoords(a1Index);
  const h1 = indexToCoords(h1Index);

  assert(a8.x === a8Coords.x && a8.y === a8Coords.y);
  assert(h8.x === h8Coords.x && h8.y === h8Coords.y);
  assert(e4.x === e4Coords.x && e4.y === e4Coords.y);
  assert(a1.x === a1Coords.x && a1.y === a1Coords.y);
  assert(h1.x === h1Coords.x && a1.y === a1Coords.y);
});

Deno.test("coords to index", () => {
  assertEquals(coordsToIndex(a8Coords.x, a8Coords.y), a8Index);
  assertEquals(coordsToIndex(h8Coords.x, h8Coords.y), h8Index);
  assertEquals(coordsToIndex(e4Coords.x, e4Coords.y), e4Index);
  assertEquals(coordsToIndex(a1Coords.x, a1Coords.y), a1Index);
  assertEquals(coordsToIndex(h1Coords.x, h1Coords.y), h1Index);
});

Deno.test("index to notation", () => {
  assertEquals(indexToNotation(a8Index), "a8");
  assertEquals(indexToNotation(h8Index), "h8");
  assertEquals(indexToNotation(e4Index), "e4");
  assertEquals(indexToNotation(a1Index), "a1");
  assertEquals(indexToNotation(h1Index), "h1");
});

Deno.test("notation to index", () => {
  assertEquals(notationToIndex("a8"), a8Index);
  assertEquals(notationToIndex("h8"), h8Index);
  assertEquals(notationToIndex("e4"), e4Index);
  assertEquals(notationToIndex("a1"), a1Index);
  assertEquals(notationToIndex("h1"), h1Index);
});