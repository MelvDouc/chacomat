import SquareIndex, { indexTable, pointTable } from "$src/constants/SquareIndex.js";
import { BOARD_WIDTH } from "$src/constants/dimensions.js";
import type Board from "$src/game/Board.js";
import Piece from "$src/pieces/Piece.js";

export default abstract class LongRangePiece extends Piece {
  public override getAttacks(srcIndex: SquareIndex, board: Board) {
    const srcPoint = pointTable[srcIndex];
    return this._offsets.x.reduce((acc, xOffset, i) => {
      let destX = srcPoint.x + xOffset;
      let destY = srcPoint.y + this._offsets.y[i];

      while (destX >= 0 && destX < BOARD_WIDTH && destY >= 0 && destY < BOARD_WIDTH) {
        const destIndex = indexTable[destY][destX];
        acc.push(destIndex);
        if (board.has(destIndex)) break;
        destX += xOffset;
        destY += this._offsets.y[i];
      }

      return acc;
    }, [] as SquareIndex[]);
  }
}