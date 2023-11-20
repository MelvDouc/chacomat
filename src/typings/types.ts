import Colors from "$src/constants/Colors.ts";
import type { PGNify } from "pgnify";

export type Board = import("$src/game/Board.ts").default;
export type Color = typeof Colors["WHITE"] | typeof Colors["BLACK"];
export type CastlingRights = import("$src/game/CastlingRights").default;
export type ChessGame = import("$src/game/ChessGame").default;
export type NAG = `$${string}`;
export type Position = import("$src/game/Position.ts").default;
export type SquareIndex = import("$src/constants/SquareIndex.ts").default;
export type Wing = "queenSide" | "kingSide";

export type Move = import("$src/moves/AbstractMove.ts").default;
export type RealMove = import("$src/moves/RealMove.ts").default;
export type NullMove = import("$src/moves/NullMove.ts").default;

export type Piece = import("$src/pieces/Piece.ts").default;
export type WhitePieceInitial = "P" | "N" | "K" | "B" | "R" | "Q";
export type BlackPieceInitial = Lowercase<WhitePieceInitial>;
export type PieceInitial = WhitePieceInitial | BlackPieceInitial;

export interface Point {
  x: number;
  y: number;
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

export type PGNHeaders = PGNify.PGNHeaders;
export type GameResult = PGNify.GameResult;