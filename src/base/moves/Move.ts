import { IBoard, IMove } from "@/typings/types.ts";

export default abstract class Move implements IMove {
  public abstract readonly srcIndex: number;
  public abstract readonly destIndex: number;

  public abstract try(board: IBoard): () => void;
  public abstract algebraicNotation(board: IBoard, legalMoves: IMove[]): string;

  public computerNotation(board: IBoard) {
    return board.indexToNotation(this.srcIndex) + board.indexToNotation(this.destIndex);
  }

  public toJSON(board: IBoard, legalMoves: IMove[]) {
    return {
      srcIndex: this.srcIndex,
      destIndex: this.destIndex,
      algebraicNotation: this.algebraicNotation(board, legalMoves)
    };
  }
}