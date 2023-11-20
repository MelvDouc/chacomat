import SquareIndex, { pointTable } from "$src/constants/SquareIndex";
import globalConfig from "$src/global-config";
import AbstractMove from "$src/moves/AbstractMove";
import { Board, Piece, Position } from "$src/typings/types";

export default abstract class RealMove extends AbstractMove {
  abstract readonly srcPiece: Piece;

  abstract get srcIndex(): SquareIndex;
  abstract get destIndex(): SquareIndex;
  abstract get destPiece(): Piece | null;

  abstract undo(board: Board): void;

  get srcPoint() {
    return pointTable[this.srcIndex];
  }

  get destPoint() {
    return pointTable[this.destIndex];
  }

  get srcNotation() {
    return SquareIndex[this.srcIndex];
  }

  get destNotation() {
    return SquareIndex[this.destIndex];
  }

  equals(move: AbstractMove) {
    return move instanceof RealMove
      && this.srcPiece === move.srcPiece
      && this.srcIndex === move.srcIndex
      && this.destIndex === move.destIndex;
  }

  getComputerNotation() {
    return this.srcNotation + this.destNotation;
  }

  getCheckSign(nextPosition: Position) {
    if (nextPosition.isCheckmate())
      return globalConfig.useDoublePlusForCheckmate ? "++" : "#";
    if (nextPosition.isCheck())
      return "+";
    return "";
  }

  toJSON() {
    return {
      srcIndex: this.srcIndex,
      destIndex: this.destIndex
    };
  }
}