import { Coords } from "@src/constants/Coords.js";
import Piece from "@src/constants/Piece.js";
import PieceMap from "@src/game/PieceMap.js";
import assert from "node:assert";
import { describe, it } from "node:test";

describe("A piece map", () => {
  it("should update king coordinates", () => {
    const pieceMap = new PieceMap();
    pieceMap.set(Coords.a1, Piece.KING);
    assert.strictEqual(pieceMap.kingCoords, Coords.a1);
  });
});