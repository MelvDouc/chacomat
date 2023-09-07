import { assertEquals } from "$dev_deps";
import parsePgn from "@/pgn/parse-pgn.ts";

Deno.test("parse game info", () => {
  const { metaData } = parsePgn(`[Result "*"][White "Fischer, Bobby"]`);
  assertEquals(metaData["Result"], "*");
  assertEquals(metaData["White"], "Fischer, Bobby");
});