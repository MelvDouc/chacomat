import { SquareIndex } from "$src/game/constants.js";
import Board from "$src/game/Board.js";
import Point from "$src/game/Point.js";
import Piece from "$src/pieces/Piece.js";

export default abstract class LongRangePiece extends Piece {
  public override getAttacks(srcIndex: SquareIndex, board: Board) {
    const srcPoint = Point.fromIndex(srcIndex);
    return this._offsets.x.reduce((acc, xOffset, i) => {
      let destX = srcPoint.x + xOffset;
      let destY = srcPoint.y + this._offsets.y[i];

      while (Point.isSafe(destY) && Point.isSafe(destX)) {
        const destIndex = Point.get(destY, destX).index;
        acc.push(destIndex);
        if (board.has(destIndex)) break;
        destX += xOffset;
        destY += this._offsets.y[i];
      }

      return acc;
    }, [] as SquareIndex[]);
  }
}