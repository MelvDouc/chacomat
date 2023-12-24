import type Position from "$src/game/Position.js";
import type Move from "$src/moves/AbstractMove.js";

export default class IllegalMoveError extends Error {
  public readonly position: Position;
  public readonly move: Move | null;
  public readonly notation: string | null;

  public constructor({ message, position, move, notation }: {
    message?: string;
    position: Position;
    move?: Move;
    notation?: string;
  }) {
    super(message ?? "Illegal move.");
    this.position = position;
    this.move = move ?? null;
    this.notation = notation ?? null;
  }
}