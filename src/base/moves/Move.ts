import type BaseBoard from "@/base/BaseBoard.ts";
import type Coords from "@/base/Coords.ts";

export default abstract class Move {
  public abstract readonly srcCoords: Coords;
  public abstract readonly destCoords: Coords;

  public abstract try(board: BaseBoard): () => void;
  public abstract getAlgebraicNotation(board: BaseBoard, legalMoves: Move[]): string;

  public getComputerNotation() {
    return this.srcCoords.notation + this.destCoords.notation;
  }

  public toObject(board: BaseBoard, legalMoves: Move[]) {
    return {
      srcCoords: this.srcCoords,
      destCoords: this.destCoords,
      algebraicNotation: this.getAlgebraicNotation(board, legalMoves)
    };
  }
}