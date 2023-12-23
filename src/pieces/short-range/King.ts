import ShortRangePiece from "$src/pieces/short-range/ShortRangePiece.js";

export default class King extends ShortRangePiece {
  public static readonly offsets = {
    x: [0, -1, 0, 1, -1, -1, 1, 1],
    y: [-1, 0, 1, 0, -1, 1, 1, -1]
  };
  protected static readonly _attacksMemo = new Map();

  protected override get _offsets() {
    return King.offsets;
  }

  protected override get _attacksMemo() {
    return King._attacksMemo;
  }

  public override isKing() {
    return true;
  }
}