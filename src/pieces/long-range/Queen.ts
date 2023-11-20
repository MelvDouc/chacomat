import LongRangePiece from "$src/pieces/long-range/LongRangePiece.ts";
import King from "$src/pieces/short-range/King.ts";

export default class Queen extends LongRangePiece {
  protected override get _offsets(): { x: number[]; y: number[]; } {
    return King.offsets;
  }

  public override isQueen(): boolean {
    return true;
  }
}