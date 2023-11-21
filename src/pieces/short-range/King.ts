import ShortRangePiece from "$src/pieces/short-range/ShortRangePiece.ts";
import { PieceOffsets, SquareIndex } from "$src/typings/types.ts";

export default class King extends ShortRangePiece {
  public static readonly offsets: PieceOffsets = {
    x: [0, -1, 0, 1, -1, -1, 1, 1],
    y: [-1, 0, 1, 0, -1, 1, 1, -1]
  };
  public static readonly _attacksMemo: Map<SquareIndex, SquareIndex[]> = new Map();

  protected override get _offsets(): PieceOffsets {
    return King.offsets;
  }

  protected override get _attacksMemo(): Map<SquareIndex, SquareIndex[]> {
    return King._attacksMemo;
  }

  public override isKing(): boolean {
    return true;
  }
}