import LongRangePiece from "$src/pieces/long-range/LongRangePiece.js";

export default class Rook extends LongRangePiece {
  public static readonly offsets = {
    x: [0, -1, 0, 1],
    y: [-1, 0, 1, 0]
  };

  protected override get _offsets() {
    return Rook.offsets;
  }

  public override isRook() {
    return true;
  }
}