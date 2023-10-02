import IColor from "@/typings/IColor.ts";
import IPiece, { JSONPiece } from "@/typings/IPiece.ts";
import { Coords } from "@/typings/types.ts";

export default interface IBoard {
  readonly height: number;
  readonly width: number;
  get pieceCount(): number;
  // conversions
  indexToRank(index: number): number;
  indexToFile(index: number): number;
  indexToCoords(index: number): Coords;
  coordsToIndex(x: number, y: number): number;
  isSafeCoords(x: number, y: number): boolean;
  indexToNotation(index: number): string;
  indexToRankNotation(index: number): string;
  indexToFileNotation(index: number): string;
  notationToIndex(notation: string): number;
  //
  pieceRank(color: IColor): number;
  pawnRank(color: IColor): number;
  //
  addPiecesFromString(boardStr: string): IBoard;
  has(index: number): boolean;
  get(index: number): IPiece | null;
  at(x: number, y: number): IPiece | null;
  set(index: number, piece: IPiece): IBoard;
  delete(index: number): IBoard;
  pieceFromInitial(initial: string): IPiece | undefined;
  getKingIndex(color: IColor): number;
  piecesOfColor(color: IColor): [number, IPiece][];
  nonKingPieces(): Map<IColor, [number, IPiece][]>;
  attackedIndices(srcCoords: number): Generator<number>;
  getAttackedIndicesSet(color: IColor): Set<number>;
  isColorInCheck(color: IColor): boolean;
  clone(): IBoard;
  toArray(): JSONBoard;
}

export type JSONBoard = (JSONPiece | null)[][];