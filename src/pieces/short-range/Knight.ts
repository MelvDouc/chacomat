import ShortRangePiece from "$src/pieces/short-range/ShortRangePiece.ts";

export default class Knight extends ShortRangePiece {
  static readonly offsets = {
    x: [-1, -2, -2, -1, 1, 2, 2, 1],
    y: [-2, -1, 1, 2, 2, 1, -1, -2]
  };

  protected get _offsets() {
    return Knight.offsets;
  }

  isKnight() {
    return true;
  }
}