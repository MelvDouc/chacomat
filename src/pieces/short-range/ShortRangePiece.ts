import Point from "$src/game/Point.js";
import { SquareIndex } from "$src/game/constants.js";
import Piece from "$src/pieces/Piece.js";
import type { PieceOffsets } from "$src/types.js";

export default abstract class ShortRangePiece extends Piece {
  protected abstract get _attacksMemo(): Map<SquareIndex, SquareIndex[]>;

  protected get _offsets() {
    return (this.constructor as typeof ShortRangePiece & { offsets: PieceOffsets; }).offsets;
  }

  public override getAttacks(srcIndex: SquareIndex) {
    if (!this._attacksMemo.has(srcIndex)) {
      const srcPoint = Point.fromIndex(srcIndex);
      const attacks = this._offsets.x.reduce((acc, xOffset, i) => {
        const destX = srcPoint.x + xOffset;
        const destY = srcPoint.y + this._offsets.y[i];

        if (Point.isSafe(destY) && Point.isSafe(destX))
          acc.push(Point.get(destY, destX).index);

        return acc;
      }, [] as SquareIndex[]);
      this._attacksMemo.set(srcIndex, attacks);
    }

    return this._attacksMemo.get(srcIndex)!;
  }
}