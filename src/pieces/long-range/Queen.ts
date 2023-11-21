import LongRangePiece from "$src/pieces/long-range/LongRangePiece.ts";
import King from "$src/pieces/short-range/King.ts";
import { PieceOffsets } from "$src/typings/types.ts";

export default class Queen extends LongRangePiece {
  protected override get _offsets(): PieceOffsets {
    return King.offsets;
  }

  public override isQueen(): boolean {
    return true;
  }
}