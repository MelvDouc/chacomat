import LongRangePiece from "$src/pieces/long-range/LongRangePiece";
import King from "$src/pieces/short-range/King";

export default class Queen extends LongRangePiece {
  protected get _offsets() {
    return King.offsets;
  }

  isQueen() {
    return true;
  }
}