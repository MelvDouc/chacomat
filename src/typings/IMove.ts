import IBoard from "@/typings/IBoard.ts";

export default interface IMove {
  readonly srcIndex: number;
  readonly destIndex: number;
  try(board: IBoard): () => void;
  algebraicNotation(board: IBoard, legalMoves: IMove[]): string;
  computerNotation(board: IBoard): string;
  toJSON(board: IBoard, legalMoves: IMove[]): JSONMove;
}

export interface JSONMove {
  srcIndex: number;
  destIndex: number;
  algebraicNotation: string;
}