import ShortRangePiece from "$src/pieces/short-range/ShortRangePiece.ts";
import { SquareIndex } from "$src/typings/types.ts";

export default class Knight extends ShortRangePiece {
  public static readonly offsets = {
    x: [-1, -2, -2, -1, 1, 2, 2, 1],
    y: [-2, -1, 1, 2, 2, 1, -1, -2]
  };
  public static readonly _attacksMemo: Map<SquareIndex, SquareIndex[]> = new Map();

  protected override get _offsets() {
    return Knight.offsets;
  }

  protected override get _attacksMemo(): Map<SquareIndex, SquareIndex[]> {
    return Knight._attacksMemo;
  }

  public override isKnight() {
    return true;
  }
}