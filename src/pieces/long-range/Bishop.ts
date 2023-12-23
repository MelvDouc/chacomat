import LongRangePiece from "$src/pieces/long-range/LongRangePiece.js";

export default class Bishop extends LongRangePiece {
  public static readonly offsets = {
    x: [-1, -1, 1, 1],
    y: [-1, 1, 1, -1]
  };

  protected override get _offsets() {
    return Bishop.offsets;
  }

  public override isBishop() {
    return true;
  }
}