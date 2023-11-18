import ShortRangePiece from "$src/pieces/short-range/ShortRangePiece";
import { SquareIndex } from "$src/typings/types";

export default class Knight extends ShortRangePiece {
  static readonly offsets = {
    x: [-1, -2, -2, -1, 1, 2, 2, 1],
    y: [-2, -1, 1, 2, 2, 1, -1, -2]
  };

  static readonly _attacksMemo = new Map<SquareIndex, SquareIndex[]>();

  protected get _offsets() {
    return Knight.offsets;
  }

  protected get _attacksMemo() {
    return Knight._attacksMemo;
  }

  isKnight() {
    return true;
  }
}