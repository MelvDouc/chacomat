import Chess960Position from "@/variants/chess960/Chess960Position.ts";
import { assert, assertLess } from "@dev_deps";

Deno.test("chess960 position to string", () => {
  const pos = Chess960Position.new();
  const boardStr = pos.board.toString();
  const kIndex = boardStr.indexOf("k");
  assertLess(boardStr.indexOf("r"), kIndex);
  assertLess(kIndex, boardStr.lastIndexOf("r"));
  assert(boardStr.indexOf("b") % 2 !== boardStr.lastIndexOf("b") % 2);
});