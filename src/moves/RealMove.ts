import { SquareIndex } from "$src/game/constants.js";
import type Board from "$src/game/Board.js";
import Point from "$src/game/Point.js";
import AbstractMove from "$src/moves/AbstractMove.js";
import type Piece from "$src/pieces/Piece.js";

export default abstract class RealMove extends AbstractMove {
  public abstract readonly srcPiece: Piece;
  public abstract readonly srcIndex: SquareIndex;
  public abstract readonly destIndex: SquareIndex;
  public abstract readonly destPiece: Piece | null;

  public abstract undo(board: Board): void;

  public get srcPoint() {
    return Point.fromIndex(this.srcIndex);
  }

  public get destPoint() {
    return Point.fromIndex(this.destIndex);
  }

  public override equals(move: AbstractMove) {
    return move instanceof RealMove
      && this.srcPiece === move.srcPiece
      && this.srcIndex === move.srcIndex
      && this.destIndex === move.destIndex;
  }

  public getComputerNotation() {
    return this.srcPoint.notation + this.destPoint.notation;
  }
}