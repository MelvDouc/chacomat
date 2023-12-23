import SquareIndex, { pointTable } from "$src/constants/SquareIndex.ts";
import type Board from "$src/game/Board.ts";
import type Position from "$src/game/Position.ts";
import globalConfig from "$src/global-config.ts";
import AbstractMove from "$src/moves/AbstractMove.ts";
import type Piece from "$src/pieces/Piece.ts";
import { Point } from "$src/typings/types.ts";

export default abstract class RealMove extends AbstractMove {
  public abstract readonly srcPiece: Piece;

  public abstract get srcIndex(): SquareIndex;
  public abstract get destIndex(): SquareIndex;
  public abstract get destPiece(): Piece | null;

  public abstract undo(board: Board): void;

  public get srcPoint(): Point {
    return pointTable[this.srcIndex];
  }

  public get destPoint(): Point {
    return pointTable[this.destIndex];
  }

  public get srcNotation(): string {
    return SquareIndex[this.srcIndex];
  }

  public get destNotation(): string {
    return SquareIndex[this.destIndex];
  }

  public override equals(move: AbstractMove): boolean {
    return move instanceof RealMove
      && this.srcPiece === move.srcPiece
      && this.srcIndex === move.srcIndex
      && this.destIndex === move.destIndex;
  }

  public getComputerNotation(): string {
    return this.srcNotation + this.destNotation;
  }

  public getCheckSign(nextPosition: Position): string {
    if (nextPosition.isCheckmate())
      return globalConfig.useDoublePlusForCheckmate ? "++" : "#";
    if (nextPosition.isCheck())
      return "+";
    return "";
  }

  public override toJSON(): {
    srcIndex: number;
    destIndex: number;
  } {
    return {
      srcIndex: this.srcIndex,
      destIndex: this.destIndex
    };
  }
}