import LongRangePiece from "$src/pieces/long-range/LongRangePiece.ts";

export default class Bishop extends LongRangePiece {
  static readonly offsets = {
    x: [-1, -1, 1, 1],
    y: [-1, 1, 1, -1]
  };

  protected get _offsets() {
    return Bishop.offsets;
  }

  isBishop() {
    return true;
  }
}