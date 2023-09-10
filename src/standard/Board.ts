import BaseBoard from "@/base/BaseBoard.ts";
import Color from "@/constants/Color.ts";
import Piece from "@/standard/Piece.ts";

export default class Board extends BaseBoard<Piece> {
  public readonly castlingMultiplier: number = 2;
  public readonly initialKingIndices = new Map([
    [Color.WHITE, 60],
    [Color.BLACK, 4]
  ]);

  public get PieceConstructor(): typeof Piece {
    return Piece;
  }

  public getCastledKingIndex(color: Color, rookSrcIndex: number) {
    return this.initialKingIndices.get(color)! + this.castlingMultiplier * Math.sign(rookSrcIndex - this.getKingIndex(color));
  }

  public canCastle(rookSrcIndex: number, color: Color, attackedIndices: Set<number>): boolean {
    const kingSrcIndex = this.getKingIndex(color),
      direction = Math.sign(rookSrcIndex - kingSrcIndex),
      kingDestIndex = this.initialKingIndices.get(color)! + this.castlingMultiplier * direction,
      rookDestIndex = kingDestIndex - direction;

    const kingYOffset = Math.sign(kingDestIndex - kingSrcIndex);
    for (let i = kingSrcIndex; i !== kingDestIndex;) {
      i += kingYOffset;
      if (this.has(i) && i !== rookSrcIndex || attackedIndices.has(i))
        return false;
    }

    const rookYOffset = Math.sign(rookDestIndex - rookSrcIndex);
    for (let i = rookSrcIndex; i !== rookDestIndex;) {
      i += rookYOffset;
      if (this.has(i) && i !== kingSrcIndex)
        return false;
    }

    return true;
  }
}