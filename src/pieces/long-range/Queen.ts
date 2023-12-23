import LongRangePiece from "$src/pieces/long-range/LongRangePiece.js";
import King from "$src/pieces/short-range/King.js";

export default class Queen extends LongRangePiece {
  protected override get _offsets() {
    return King.offsets;
  }

  public override isQueen() {
    return true;
  }
}