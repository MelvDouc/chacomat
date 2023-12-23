import ShortRangePiece from "$src/pieces/short-range/ShortRangePiece.js";

export default class Knight extends ShortRangePiece {
  public static readonly offsets = {
    x: [-1, -2, -2, -1, 1, 2, 2, 1],
    y: [-2, -1, 1, 2, 2, 1, -1, -2]
  };
  protected static readonly _attacksMemo = new Map();

  protected override get _offsets() {
    return Knight.offsets;
  }

  protected override get _attacksMemo() {
    return Knight._attacksMemo;
  }

  public override isKnight() {
    return true;
  }
}