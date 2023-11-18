import LongRangePiece from "$src/pieces/long-range/LongRangePiece";

export default class Rook extends LongRangePiece {
  static readonly offsets = {
    x: [0, -1, 0, 1],
    y: [-1, 0, 1, 0]
  };

  protected get _offsets() {
    return Rook.offsets;
  }

  isRook() {
    return true;
  }
}