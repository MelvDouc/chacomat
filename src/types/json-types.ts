export interface Piece {
  initial: string;
  color: string;
}

export interface Coords {
  x: number;
  y: number;
  notation: string;
  index: number;
}

export interface Move {
  srcCoords: Coords;
  destCoords: Coords;
  algebraicNotation: string;
}

export type Board = (Piece | null)[][];

export interface ShatranjPosition {
  activeColor: string;
  board: Board;
  legalMoves: Move[];
  status: import("@/types/main-types.ts").PositionStatus;
  next: [Move, ShatranjPosition][];
  fen: string;
}

export interface Position {
  activeColor: string;
  castlingRights: Record<string, number[]>;
  enPassantCoords: Coords | null;
  board: Board;
  legalMoves: Move[];
  status: import("@/types/main-types.ts").PositionStatus;
  next: [Move, Position][];
  fen: string;
}