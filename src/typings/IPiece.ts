import IColor from "@/typings/IColor.ts";

export default interface IPiece {
  readonly value: number;
  readonly initial: string;
  readonly color: IColor;
  readonly offsets: PieceOffsets;
  readonly opposite: IPiece;
  isShortRange(): boolean;
  isPawn(): boolean;
  isKing(): boolean;
  isKnight(): boolean;
  isBishop(): boolean;
  isRook(): boolean;
  isQueen(): boolean;
  toJSON(): JSONPiece;
}

export interface PieceOffsets {
  x: number[];
  y: number[];
}

export interface JSONPiece {
  initial: string;
  color: string;
}