import type { PGNParserTypes } from "@deps";

export type Board = import("@/board/Board.ts").default;
export type Color = import("@/board/Color.ts").default;
export type Coords = import("@/coordinates/Coords.ts").default;
export type ChessGame = import("@/game/ChessGame.ts").default;
export type CastlingRights = import("@/game/CastlingRights.ts").default;
export type Position = import("@/game/Position.ts").default;
export type Move = import("@/moves/Move.ts").default;
export type Piece = import("@/pieces/Piece.ts").default;

export interface PieceOffsets {
  x: number[];
  y: number[];
}

export type Direction = -1 | 1;

// ===== ===== ===== ===== =====
// JSON
// ===== ===== ===== ===== =====

export type JSONCoords = ReturnType<Coords["toJSON"]>;

export interface JSONPiece {
  initial: string;
  color: string;
}

export type JSONBoard = (JSONPiece | null)[][];

export interface JSONMove {
  srcCoords: JSONCoords;
  destCoords: JSONCoords;
  algebraicNotation: string;
}

export interface JSONPosition {
  board: JSONBoard;
  activeColor: string;
  castlingRights: Record<string, number[]>;
  enPassantCoords: JSONCoords | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  comment?: string;
}

// ===== ===== ===== ===== =====
// GAME
// ===== ===== ===== ===== =====

export type NumericAnnotationGlyph = PGNParserTypes.NumericAnnotationGlyph;
export type GameInfo = PGNParserTypes.PGNHeaders;
export type GameResult = PGNParserTypes.GameResult;

// ===== ===== ===== ===== =====
// TREE
// ===== ===== ===== ===== =====

export interface MoveTree {
  /**
   * The position after the move in the notation is played.
   */
  position: Position;
  notation: string;
  variations?: MoveTree[];
  next: MoveTree | null;
};