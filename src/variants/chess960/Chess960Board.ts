import { IColor, ICoords } from "@/typings/types.ts";
import Board from "@/variants/standard/Board.ts";

export default class Chess960Board extends Board {
  public override canCastle(rookSrcY: number, color: IColor, attackedCoords: Set<ICoords>) {
    const kingSrcCoords = this.getKingCoords(color),
      direction = Math.sign(rookSrcY - kingSrcCoords.y) as -1 | 1,
      kingDestCoords = this.coords(kingSrcCoords.x, this.castledKingFiles[direction]),
      rookDestCoords = kingDestCoords.peer(0, Math.sign(kingSrcCoords.y - rookSrcY))!,
      kingYOffset = Math.sign(kingDestCoords.y - kingSrcCoords.y),
      rookYOffset = Math.sign(rookDestCoords.y - rookSrcY);

    if (kingYOffset !== 0) {
      for (let coords = kingSrcCoords.peer(0, kingYOffset)!; ; coords = coords.peer(0, kingYOffset)!) {
        if (this.has(coords) && coords.y !== rookSrcY || attackedCoords.has(coords))
          return false;
        if (coords === kingDestCoords) break;
      }
    }

    if (rookYOffset !== 0) {
      for (let coords = this.coords(kingSrcCoords.x, rookSrcY + rookYOffset); ; coords = coords.peer(0, rookYOffset)!) {
        if (this.has(coords) && coords !== kingSrcCoords)
          return false;
        if (coords === rookDestCoords) break;
      }
    }

    return true;
  }
}