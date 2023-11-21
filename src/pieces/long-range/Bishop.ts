import LongRangePiece from "$src/pieces/long-range/LongRangePiece.ts";
import { PieceOffsets } from "$src/typings/types.ts";

export default class Bishop extends LongRangePiece {
  public static readonly offsets = {
    x: [-1, -1, 1, 1],
    y: [-1, 1, 1, -1]
  };

  protected override get _offsets(): PieceOffsets {
    return Bishop.offsets;
  }

  public override isBishop(): boolean {
    return true;
  }
}