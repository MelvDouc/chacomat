import LongRangePiece from "$src/pieces/long-range/LongRangePiece.ts";
import King from "$src/pieces/short-range/King.ts";

export default class Queen extends LongRangePiece {
  protected get _offsets() {
    return King.offsets;
  }

  isQueen() {
    return true;
  }
}