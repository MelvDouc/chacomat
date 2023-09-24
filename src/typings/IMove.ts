import IBoard from "@/typings/IBoard.ts";
import ICoords from "@/typings/ICoords.ts";

export default interface IMove {
  readonly srcCoords: ICoords;
  readonly destCoords: ICoords;
  try(board: IBoard): () => void;
  algebraicNotation(board: IBoard, legalMoves: IMove[]): string;
  computerNotation(): string;
  toJSON(board: IBoard, legalMoves: IMove[]): JSONMove;
}

export interface JSONMove {
  srcCoords: ICoords;
  destCoords: ICoords;
  algebraicNotation: string;
}