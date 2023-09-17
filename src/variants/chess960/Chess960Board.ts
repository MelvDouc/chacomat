import type Coords from "@/base/Coords.ts";
import Color from "@/constants/Color.ts";
import Board from "@/standard/Board.ts";

export default class Chess960Board extends Board {
  public canCastle(rookSrcY: number, color: Color, attackedCoords: Set<Coords>) {
    const kingSrcCoords = this.getKingCoords(color),
      direction = Math.sign(rookSrcY - kingSrcCoords.y),
      kingDestCoords = this.getCastledKingCoords(color, rookSrcY),
      rookDestCoords = kingDestCoords.peer(0, -direction)!;
    const kingYOffset = Math.sign(kingDestCoords.y - kingSrcCoords.y),
      rookYOffset = Math.sign(rookDestCoords.y - rookSrcY);

    for (let c: Coords = kingSrcCoords; c !== kingDestCoords;) {
      c = c.peer(0, kingYOffset)!;
      if (this.has(c) && c.y !== rookSrcY || attackedCoords.has(c))
        return false;
    }

    for (let c = this.Coords.get(kingSrcCoords.x, rookSrcY); c !== rookDestCoords;) {
      c = c.peer(0, rookYOffset)!;
      if (this.has(c) && c !== kingSrcCoords)
        return false;
    }

    return true;
  }
}