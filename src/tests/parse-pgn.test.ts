import { strictEqual } from "node:assert";
import { test } from "node:test";
import parsePgn from "@pgn/parse-pgn.js";

test("parse game info", () => {
  const { metaData } = parsePgn(`[Result "*"][White "Fischer, Bobby"]`);
  strictEqual(metaData["Result"], "*");
  strictEqual(metaData["White"], "Fischer, Bobby");
});