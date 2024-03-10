import { BOARD_LENGTH, SquareIndex } from "$src/game/constants.js";
import { indexToPointTable, isSafe } from "$src/game/Point.js";
import Piece from "$src/pieces/Piece.js";
import type { PieceOffsets } from "$src/types.js";

export default abstract class ShortRangePiece extends Piece {
  protected abstract get _attacksMemo(): Map<SquareIndex, SquareIndex[]>;

  protected get _offsets() {
    return (this.constructor as typeof ShortRangePiece & { offsets: PieceOffsets; }).offsets;
  }

  public override getAttacks(srcIndex: SquareIndex) {
    if (!this._attacksMemo.has(srcIndex)) {
      const { x: srcX, y: srcY } = indexToPointTable[srcIndex];
      const attacks = this._offsets.x.reduce((acc, xOffset, i) => {
        const destX = srcX + xOffset;
        const destY = srcY + this._offsets.y[i];

        if (isSafe(destY) && isSafe(destX))
          acc.push(destY * BOARD_LENGTH + destX);

        return acc;
      }, [] as SquareIndex[]);
      this._attacksMemo.set(srcIndex, attacks);
    }

    return this._attacksMemo.get(srcIndex)!;
  }
}