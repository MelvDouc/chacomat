import type Board from "$src/game/Board.js";
import type Position from "$src/game/Position.js";

export default abstract class AbstractMove {
  public NAG?: string;
  public comment?: string;

  public abstract isCapture(): boolean;
  public abstract getAlgebraicNotation(position: Position): string;
  public abstract equals(move: AbstractMove): boolean;
  public abstract play(board: Board): void;
  public abstract toJSON(): {
    srcIndex: number;
    destIndex: number;
  };
}