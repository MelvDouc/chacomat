import IColor from "@/typings/IColor.ts";
import ICoords from "@/typings/ICoords.ts";
import IPiece, { JSONPiece } from "@/typings/IPiece.ts";

export default interface IBoard {
  readonly height: number;
  readonly width: number;
  addPiecesFromString(boardStr: string): IBoard;
  has(coords: ICoords): boolean;
  get(coords: ICoords): IPiece | null;
  set(coords: ICoords, piece: IPiece): IBoard;
  delete(coords: ICoords): IBoard;
  at(x: number, y: number): IPiece | null;
  pieceCount(): number;
  pieceFromInitial(initial: string): IPiece | undefined;
  coords(x: number, y: number): ICoords;
  getKingCoords(color: IColor): ICoords;
  piecesOfColor(color: IColor): [ICoords, IPiece][];
  nonKingPieces(): Map<IColor, [ICoords, IPiece][]>;
  attackedCoords(srcCoords: ICoords): Generator<ICoords>;
  getAttackedCoordsSet(color: IColor): Set<ICoords>;
  isColorInCheck(color: IColor): boolean;
  clone(): IBoard;
  toArray(): JSONBoard;
}

export type JSONBoard = (JSONPiece | null)[][];