import { indexTable, pointTable } from "$src/constants/SquareIndex.ts";
import { BOARD_WIDTH } from "$src/constants/dimensions.ts";
import Piece from "$src/pieces/Piece.ts";
import { SquareIndex } from "$src/typings/types.ts";

export default abstract class ShortRangePiece extends Piece {
  protected readonly _attacksMemo = new Map<SquareIndex, SquareIndex[]>();

  override getAttacks(srcIndex: SquareIndex) {
    if (this._attacksMemo.has(srcIndex))
      return this._attacksMemo.get(srcIndex) as SquareIndex[];

    const srcPoint = pointTable[srcIndex];
    const attacks = this._offsets.x.reduce((acc, xOffset, i) => {
      const destX = srcPoint.x + xOffset;
      const destY = srcPoint.y + this._offsets.y[i];

      if (destX >= 0 && destX < BOARD_WIDTH && destY >= 0 && destY < BOARD_WIDTH)
        acc.push(indexTable[destY][destX]);

      return acc;
    }, [] as SquareIndex[]);
    this._attacksMemo.set(srcIndex, attacks);
    return attacks;
  }
}