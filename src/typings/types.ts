import type SquareIndex from "$src/constants/SquareIndex.js";
import type Position from "$src/game/Position.js";

export type NAG = `$${string}`;
export type Wing = "queenSide" | "kingSide";

export type WhitePieceInitial = "P" | "N" | "K" | "B" | "R" | "Q";
export type BlackPieceInitial = Lowercase<WhitePieceInitial>;
export type PieceInitial = WhitePieceInitial | BlackPieceInitial;

export interface Point {
  x: number;
  y: number;
}

export interface PieceOffsets {
  x: number[];
  y: number[];
}

// ===== ===== ===== ===== =====
// JSON
// ===== ===== ===== ===== =====

export interface JSONPiece {
  initial: PieceInitial;
  color: string;
}

export type JSONBoard = (JSONPiece | null)[][];

export type JSONCastlingRights = Record<"white" | "black", Record<Wing, boolean>>;

export interface JSONPosition {
  board: JSONBoard;
  activeColor: string;
  castlingRights: JSONCastlingRights;
  enPassantIndex: SquareIndex | null;
  halfMoveClock: number;
  fullMoveNumber: number;
}

// ===== ===== ===== ===== =====
// POSITION TREE
// ===== ===== ===== ===== =====

export interface NotationTree {
  srcPosition: Position;
  next: {
    notation: string;
    tree: NotationTree;
  }[];
}

// ===== ===== ===== ===== =====
// PGN PARSER
// ===== ===== ===== ===== =====

export type {
  GameResult,
  PGNHeaders
} from "pgnify";