import ShortRangePiece from "$src/pieces/short-range/ShortRangePiece";

export default class King extends ShortRangePiece {
  static readonly offsets = {
    x: [0, -1, 0, 1, -1, -1, 1, 1],
    y: [-1, 0, 1, 0, -1, 1, 1, -1]
  };

  protected get _offsets() {
    return King.offsets;
  }

  isKing() {
    return true;
  }
}