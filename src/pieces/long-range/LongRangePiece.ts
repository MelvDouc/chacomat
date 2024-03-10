import Board from "$src/game/Board.js";
import { indexToPointTable, isSafe } from "$src/game/Point.js";
import { BOARD_LENGTH, SquareIndex } from "$src/game/constants.js";
import Piece from "$src/pieces/Piece.js";

export default abstract class LongRangePiece extends Piece {
  public override getAttacks(srcIndex: SquareIndex, board: Board) {
    const { x: srcX, y: srcY } = indexToPointTable[srcIndex];

    return this._offsets.x.reduce((acc, xOffset, i) => {
      let destX = srcX + xOffset;
      let destY = srcY + this._offsets.y[i];

      while (isSafe(destY) && isSafe(destX)) {
        const destIndex = destY * BOARD_LENGTH + destX;
        acc.push(destIndex);
        if (board.has(destIndex)) break;
        destX += xOffset;
        destY += this._offsets.y[i];
      }

      return acc;
    }, [] as SquareIndex[]);
  }
}