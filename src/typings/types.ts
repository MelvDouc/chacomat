import Colors from "$src/constants/Colors.ts";
import type SquareIndex from "$src/constants/SquareIndex.ts";

export type Color = typeof Colors["WHITE"] | typeof Colors["BLACK"];
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

export type ColorName = typeof Colors[typeof Colors.WHITE | typeof Colors.BLACK];

export interface JSONPiece {
  initial: PieceInitial;
  color: ColorName;
}

export type JSONBoard = (JSONPiece | null)[][];

export type JSONCastlingRights = Record<Wing, Record<Color, boolean>>;

export interface JSONPosition {
  board: JSONBoard;
  activeColor: ColorName;
  castlingRights: JSONCastlingRights;
  enPassantIndex: SquareIndex | null;
  halfMoveClock: number;
  fullMoveNumber: number;
}

// ===== ===== ===== ===== =====
// PGN PARSER
// ===== ===== ===== ===== =====

export {
  GameResult,
  PGNHeaders
} from "pgnify";