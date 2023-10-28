import GameResults from "@/game/GameResults.ts";
import { NumericAnnotationGlyphTable } from "@/moves/MoveAnnotations.ts";

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

export type NumericAnnotationGlyph = keyof typeof NumericAnnotationGlyphTable;

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

export type GameInfo = Partial<BaseGameInfo> & {
  Result: GameResult;
  [key: string]: unknown;
};

interface BaseGameInfo {
  White: string;
  Black: string;
  Site: string;
  Event: string;
  /** Should be in the format `YYYY.MM.DD`. */
  Date: string;
  EventDate: string;
  Round: string;
  TimeControl: string;
  FEN: string;
  ECO: string;
  Opening: string;
  Variation: string;
  PlyCount: string;
  SetUp: string;
  Termination: string;
  WhiteElo: string;
  BlackElo: string;
  BlackTitle: string;
  WhiteTitle: string;
}

export type GameResult = typeof GameResults[keyof typeof GameResults];

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