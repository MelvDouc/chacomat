import { IBoard, ICoords, IMove } from "@/typings/types.ts";

export default abstract class Move implements IMove {
  public abstract readonly srcCoords: ICoords;
  public abstract readonly destCoords: ICoords;

  public abstract try(board: IBoard): () => void;
  public abstract algebraicNotation(board: IBoard, legalMoves: IMove[]): string;

  public computerNotation() {
    return this.srcCoords.notation + this.destCoords.notation;
  }

  public toJSON(board: IBoard, legalMoves: IMove[]) {
    return {
      srcCoords: this.srcCoords,
      destCoords: this.destCoords,
      algebraicNotation: this.algebraicNotation(board, legalMoves)
    };
  }
}