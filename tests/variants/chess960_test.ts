import { assertEquals, assertGreater, assertLess, assertNotEquals } from "$dev_deps";
import Color from "@/constants/Color.ts";
import { Coordinates } from "@/types/main-types.ts";
import Chess960Game from "@/variants/chess960/Chess960Game.ts";

Deno.test("Board validity", () => {
  const { currentPosition } = new Chess960Game();
  const whitePieceCoords = {} as Record<string, Coordinates[]>;
  currentPosition.board.getPiecesOfColor(Color.WHITE).forEach(([coords, { initial }]) => {
    initial in whitePieceCoords
      ? whitePieceCoords[initial].push(coords)
      : (whitePieceCoords[initial] = [coords]);
  });

  assertEquals(whitePieceCoords.K?.length, 1);
  assertEquals(whitePieceCoords.R?.length, 2);
  assertLess(whitePieceCoords.R[0].y, whitePieceCoords.K[0].y);
  assertGreater(whitePieceCoords.R[1].y, whitePieceCoords.K[0].y);
  assertNotEquals(whitePieceCoords.B[0].isLightSquare(), whitePieceCoords.B[1].isLightSquare());
});