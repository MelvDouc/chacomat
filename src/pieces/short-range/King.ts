import ShortRangePiece from "$src/pieces/short-range/ShortRangePiece";
import { SquareIndex } from "$src/typings/types";

export default class King extends ShortRangePiece {
  static readonly offsets = {
    x: [0, -1, 0, 1, -1, -1, 1, 1],
    y: [-1, 0, 1, 0, -1, 1, 1, -1]
  };

  static readonly _attacksMemo = new Map<SquareIndex, SquareIndex[]>();

  protected get _offsets() {
    return King.offsets;
  }

  protected get _attacksMemo() {
    return King._attacksMemo;
  }

  isKing() {
    return true;
  }
}