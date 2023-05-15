import parseVariations from "@src/pgn-fen/parse-variations.js";
import assert from "node:assert";
import { describe, it } from "node:test";

describe("parseVariations", () => {
  it("should find all nested variations", () => {
    const pgn = "1. e4 e5 2. Nf3 ( 2. Nc3 ) ( 2. Bc4 Nf6 3. d4 Nxe4 ( 3... Nxe5 ) ) Nc6";
    const { variations } = parseVariations(pgn);
    assert.strictEqual(variations.length, 2);
    assert.strictEqual(variations[1].variations.length, 1);
  });
});