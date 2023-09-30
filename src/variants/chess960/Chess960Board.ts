import { IColor } from "@/typings/types.ts";
import Board from "@/variants/standard/Board.ts";

export default class Chess960Board extends Board {
  public override canCastle(rookSrcIndex: number, color: IColor, attackedIndices: Set<number>) {
    const kingSrcIndex = this.getKingIndex(color),
      kingDestIndex = this.castledKingIndex(color, Math.sign(rookSrcIndex - kingSrcIndex)),
      kingOffset = Math.sign(kingDestIndex - kingSrcIndex),
      rookDestIndex = kingDestIndex - kingOffset,
      rookOffset = Math.sign(rookDestIndex - rookSrcIndex);

    if (kingOffset !== 0)
      for (let kingIndex = kingSrcIndex + kingOffset; ; kingIndex += kingOffset) {
        if (this.has(kingIndex) && kingIndex !== rookSrcIndex || attackedIndices.has(kingIndex))
          return false;
        if (kingIndex === kingDestIndex) break;
      }

    if (rookOffset !== 0)
      for (let rookIndex = rookSrcIndex + rookOffset; ; rookIndex += rookOffset) {
        if (this.has(rookIndex) && rookIndex !== kingSrcIndex)
          return false;
        if (rookIndex === rookDestIndex) break;
      }

    return true;
  }
}