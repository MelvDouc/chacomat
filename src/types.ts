import type { SquareIndex } from "$src/game/constants.js";
import type { PGNify } from "pgnify";

export type NAG = `$${string}`;
export type Wing = "queenSide" | "kingSide";

export type WhitePieceInitial = "P" | "N" | "K" | "B" | "R" | "Q";
export type BlackPieceInitial = Lowercase<WhitePieceInitial>;
export type PieceInitial = WhitePieceInitial | BlackPieceInitial;

export interface Point {
  readonly x: number;
  readonly y: number;
  get index(): number;
  get notation(): string;
  get rankNotation(): string;
  get fileNotation(): string;
  isLightSquare(): boolean;
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

export type { PositionTree } from "$src/game/PositionTree.js";

// ===== ===== ===== ===== =====
// PGN PARSER
// ===== ===== ===== ===== =====

export type PGNHeaders = PGNify.PGNHeaders;
export type GameResult = PGNify.GameResult;
