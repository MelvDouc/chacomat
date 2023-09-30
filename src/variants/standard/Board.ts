import { IColor } from "@/typings/types.ts";
import ShatranjBoard from "@/variants/shatranj/ShatranjBoard.ts";
import Piece from "@/variants/standard/Piece.ts";

export default class Board extends ShatranjBoard {
  public readonly castlingMultiplier: number = 2;

  public canCastle(rookSrcIndex: number, color: IColor, attackedIndices: Set<number>): boolean {
    const kingSrcIndex = this.getKingIndex(color),
      direction = Math.sign(rookSrcIndex - kingSrcIndex),
      rookDestIndex = this.castledRookIndex(color, direction);

    for (let i = 1; i <= this.castlingMultiplier; i++) {
      const kingIndex = kingSrcIndex + direction * i;
      if (this.has(kingIndex) && kingIndex !== rookSrcIndex || attackedIndices.has(kingIndex))
        return false;
    }

    for (let rookIndex = rookSrcIndex - direction; ; rookIndex -= direction) {
      if (this.has(rookIndex) && rookIndex !== kingSrcIndex)
        return false;
      if (rookIndex === rookDestIndex) break;
    }

    return true;
  }

  public castledKingIndex(color: IColor, direction: number) {
    return this.originalKingIndex(color) + this.castlingMultiplier * direction;
  }

  public castledRookIndex(color: IColor, direction: number) {
    return this.castledKingIndex(color, direction) - direction;
  }

  public override pieceFromInitial(initial: string) {
    return Piece.fromInitial(initial);
  }

  // ===== ===== ===== ===== =====
  // PROTECTED
  // ===== ===== ===== ===== =====

  protected readonly originalKingY: number = 4;

  protected originalKingIndex(color: IColor) {
    return this.width * this.pieceRank(color) + this.originalKingY;
  }
}