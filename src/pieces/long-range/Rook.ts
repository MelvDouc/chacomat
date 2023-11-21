import LongRangePiece from "$src/pieces/long-range/LongRangePiece.ts";
import { PieceOffsets } from "$src/typings/types.ts";

export default class Rook extends LongRangePiece {
  public static readonly offsets = {
    x: [0, -1, 0, 1],
    y: [-1, 0, 1, 0]
  };

  protected override get _offsets(): PieceOffsets {
    return Rook.offsets;
  }

  public override isRook(): boolean {
    return true;
  }
}