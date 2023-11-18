import { Board, Position } from "$src/typings/types";

export default abstract class AbstractMove {
  public NAG?: string;
  public comment?: string;

  abstract isCapture(): boolean;
  abstract getAlgebraicNotation(position: Position): string;
  abstract equals(move: AbstractMove): boolean;
  abstract play(board: Board): void;
}