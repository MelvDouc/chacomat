import Colors from "$src/constants/Colors";
import { pawnRanks } from "$src/constants/Ranks";
import SquareIndex, { indexTable, pointTable } from "$src/constants/SquareIndex";
import ShortRangePiece from "$src/pieces/short-range/ShortRangePiece";
import { Board } from "$src/typings/types";

export default class Pawn extends ShortRangePiece {
  static readonly attackOffsets = {
    [Colors.WHITE]: {
      x: [-1, 1],
      y: [1, 1]
    },
    [Colors.BLACK]: {
      x: [-1, 1],
      y: [-1, -1]
    }
  };

  protected readonly _attacksMemo = new Map<SquareIndex, SquareIndex[]>();

  get direction() {
    return this.color;
  }

  protected get _offsets() {
    return Pawn.attackOffsets[this.color];
  }

  isPawn() {
    return true;
  }

  override getPseudoLegalDestIndices(params: {
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
    const { x, y } = pointTable[srcIndex];
    const destIndex = indexTable[y + this.direction][x];

    if (!board.has(destIndex)) {
      yield destIndex;

      if (y === pawnRanks[this.color]) {
        const destIndex = indexTable[y + this.direction * 2][x];

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
      if (board.get(destIndex)?.color === -this.color || destIndex === enPassantIndex)
        yield destIndex;
  }
}