import Board from "$src/game/Board.js";
import Color from "$src/game/Color.js";
import Point from "$src/game/Point.js";
import { SquareIndex } from "$src/game/constants.js";
import ShortRangePiece from "$src/pieces/short-range/ShortRangePiece.js";

export default class Pawn extends ShortRangePiece {
  public static readonly attackOffsets = new Map([
    [Color.White, { x: [-1, 1], y: [1, 1] }],
    [Color.Black, { x: [-1, 1], y: [-1, -1] }]
  ]);

  protected readonly _attacksMemo = new Map();

  protected override get _offsets() {
    return Pawn.attackOffsets.get(this.color)!;
  }

  public override isPawn() {
    return true;
  }

  public override getPseudoLegalDestIndices(params: {
    srcIndex: SquareIndex;
    board: Board;
    enPassantIndex: SquareIndex | null;
  }) {
    return [
      ...this._forwardIndices(params),
      ...this._captureIndices(params)
    ];
  }

  private *_forwardIndices({ board, srcIndex }: {
    board: Board;
    srcIndex: SquareIndex;
  }) {
    const { x, y } = Point.fromIndex(srcIndex);
    const destIndex = Point.get(y + this.color.direction, x).index;

    if (!board.has(destIndex)) {
      yield destIndex;

      if (y === this.color.initialPawnRank) {
        const destIndex = Point.get(y + this.color.direction * 2, x).index;

        if (!board.has(destIndex))
          yield destIndex;
      }
    }
  }

  private *_captureIndices({ srcIndex, board, enPassantIndex }: {
    board: Board;
    srcIndex: SquareIndex;
    enPassantIndex: number | null;
  }) {
    for (const destIndex of this.getAttacks(srcIndex))
      if (board.get(destIndex)?.color === this.color.opposite || destIndex === enPassantIndex)
        yield destIndex;
  }
}