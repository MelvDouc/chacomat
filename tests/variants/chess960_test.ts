import { assertEquals, assertGreater, assertLess, assertNotEquals } from "$dev_deps";
import Color from "@/constants/Color.ts";
import type Coords from "@/constants/Coords.ts";
import Chess960Game from "@/variants/chess960/game/Chess960Game.ts";

Deno.test("Board validity", () => {
  const { currentPosition } = new Chess960Game();
  const whitePieceCoords = [...currentPosition.board.entries()].reduce((acc, [coords, { color, initial }]) => {
    if (color === Color.WHITE) {
      if (initial in acc)
        acc[initial].push(coords);
      else
        acc[initial] = [coords];
    }
    return acc;
  }, {} as Record<string, Coords[]>);

  assertEquals(whitePieceCoords.K?.length, 1);
  assertEquals(whitePieceCoords.R?.length, 2);
  assertLess(whitePieceCoords.R[0].y, whitePieceCoords.K[0].y);
  assertGreater(whitePieceCoords.R[1].y, whitePieceCoords.K[0].y);
  assertNotEquals(whitePieceCoords.B[0].isLightSquare(), whitePieceCoords.B[1].isLightSquare());
});