import Colors from "$src/constants/Colors";
import type { PGNify } from "pgnify";

export type Board = import("$src/game/Board").default;
export type Color = typeof Colors["WHITE"] | typeof Colors["BLACK"];
export type CastlingRights = import("$src/game/CastlingRights").default;
export type ChessGame = import("$src/game/ChessGame").default;
export type NAG = `$${string}`;
export type Position = import("$src/game/Position").default;
export type SquareIndex = import("$src/constants/SquareIndex").default;
export type Wing = "queenSide" | "kingSide";

export type Move = import("$src/moves/AbstractMove").default;
export type RealMove = import("$src/moves/RealMove").default;
export type NullMove = import("$src/moves/NullMove").default;

export type Piece = import("$src/pieces/Piece").default;
export type WhitePieceInitial = "P" | "N" | "K" | "B" | "R" | "Q";
export type BlackPieceInitial = Lowercase<WhitePieceInitial>;
export type PieceInitial = WhitePieceInitial | BlackPieceInitial;

export interface Point {
  x: number;
  y: number;
}

export interface MoveTree {
  position: Position;
  comment?: string;
  moves: {
    notation: string;
    NAG?: string;
    comment?: string;
    next: MoveTree;
  }[];
}

// ===== ===== ===== ===== =====
// PGN PARSER
// ===== ===== ===== ===== =====

export type PGNHeaders = PGNify.PGNHeaders;
export type GameResult = PGNify.GameResult;