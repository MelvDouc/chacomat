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

export interface Position {
  activeColor: string;
  castlingRights: Record<string, number[]>;
  enPassantCoords: Coords | null;
  board: Board;
  legalMoves: Move[];
  status: import("@/types/types.ts").PositionStatus;
  next: [Move, Position][];
  fen: string;
}