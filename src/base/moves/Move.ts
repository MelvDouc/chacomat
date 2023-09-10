import BaseBoard from "@/base/BaseBoard.ts";

export default abstract class Move {
  public abstract readonly srcIndex: number;
  public abstract readonly destIndex: number;

  public abstract try(board: BaseBoard): () => void;
  public abstract getAlgebraicNotation(board: BaseBoard, legalMoves: Move[]): string;

  public getSrcCoords(board: BaseBoard) {
    return board.indexToCoords(this.srcIndex);
  }

  public getDestCoords(board: BaseBoard) {
    return board.indexToCoords(this.destIndex);
  }

  public getComputerNotation(board: BaseBoard) {
    return board.getNotation(this.srcIndex) + board.getNotation(this.destIndex);
  }

  public toObject(board: BaseBoard, legalMoves: Move[]) {
    return {
      srcIndex: this.srcIndex,
      destIndex: this.destIndex,
      algebraicNotation: this.getAlgebraicNotation(board, legalMoves)
    };
  }
}