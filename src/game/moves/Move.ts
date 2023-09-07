import type Coords from "@/constants/Coords.ts";
import type Board from "@/game/Board.ts";

export default abstract class Move {
  public constructor(
    public readonly srcCoords: Coords,
    public readonly destCoords: Coords
  ) { }

  /**
   * Play the move on the board.
   * @param board The move to apply the move to.
   * @returns An undo function.
   */
  public abstract try(board: Board): () => void;
  public abstract getAlgebraicNotation(board: Board, legalMoves: Move[]): string;

  public getComputerNotation() {
    return this.srcCoords.notation + this.destCoords.notation;
  }
}