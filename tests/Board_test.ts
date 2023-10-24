import { assertEquals } from "@dev_deps";
import { Board, Color, coords } from "../mod.ts";
import { assert } from "./test.index.ts";

Deno.test("Get board from string.", () => {
  const board = Board.fromString("8/2K1k3/8/8/8/8/8/8");
  const whiteKingCoords = coords[2][1];
  const blackKingCoords = coords[4][1];

  assert(board.get(whiteKingCoords)?.isKing());
  assert(board.get(whiteKingCoords)?.color.name === "white");
  assert(board.get(blackKingCoords)?.isKing());
  assert(board.get(blackKingCoords)?.color.name === "black");
});

Deno.test("board cloning", () => {
  const board = Board.fromString("8/2K1k3/8/8/8/8/8/8");
  const clone = board.clone();

  assertEquals(board.pieces.size, clone.pieces.size);
  for (const [coords, piece] of board.pieces)
    if (clone.get(coords) !== piece)
      assert(false);
});

Deno.test("King coordinates should be auto-updated.", () => {
  const board = Board.fromString("8/2K1k3/8/8/8/8/8/8");
  const kingCoords = board.getKingCoords(Color.WHITE);
  board.set(coords[1][1], board.get(kingCoords)!);
  assertEquals(board.getKingCoords(Color.WHITE), coords[1][1]);
});

Deno.test("A board should be stringifiable and parsable from the same string.", () => {
  const boardStr = "8/2K1k3/8/8/8/8/8/8";
  const board = Board.fromString(boardStr);
  assertEquals(board.toString(), boardStr);
});