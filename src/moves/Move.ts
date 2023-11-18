import SquareIndex, { pointTable } from "$src/constants/SquareIndex";
import globalConfig from "$src/global-config";
import {
  Board,
  NAG,
  Piece,
  Position
} from "$src/typings/types";

export default abstract class Move {
  public NAG?: NAG;

  abstract readonly srcPiece: Piece;

  abstract get srcIndex(): SquareIndex;
  abstract get destIndex(): SquareIndex;
  abstract get destPiece(): Piece | null;

  abstract play(board: Board): void;
  abstract undo(board: Board): void;
  abstract isCapture(): boolean;
  abstract getAlgebraicNotation(position: Position): string;

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

  getComputerNotation() {
    return this.srcNotation + this.destNotation;
  }

  getFullAlgebraicNotation(positionBefore: Position, positionAfter: Position) {
    return this.getAlgebraicNotation(positionBefore)
      + this.getCheckSign(positionAfter)
      + (this.NAG ? ` ${this.NAG}` : "");
  }

  getCheckSign(nextPosition: Position) {
    if (nextPosition.isCheckmate())
      return globalConfig.useDoublePlusForCheckmate ? "++" : "#";
    if (nextPosition.isCheck())
      return "+";
    return "";
  }
}