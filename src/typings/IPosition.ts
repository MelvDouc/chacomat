import IBoard, { JSONBoard } from "@/typings/IBoard.ts";
import IColor from "@/typings/IColor.ts";
import IMove from "@/typings/IMove.ts";

export default interface IPosition {
  readonly board: IBoard;
  readonly activeColor: IColor;
  readonly fullMoveNumber: number;
  comment?: string;
  get legalMoves(): IMove[];
  get legalMovesAsAlgebraicNotation(): string[];
  isCheck(): boolean;
  isMainLine(): boolean;
  toMoveList(): string;
  toJSON(): JSONPosition;
}

export interface JSONPosition {
  board: JSONBoard;
  activeColor: string;
  fullMoveNumber: number;
  comment?: string;
}