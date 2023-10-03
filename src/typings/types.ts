import type Board from "@/board/Board.ts";
import type Color from "@/board/Color.ts";
import type Coords from "@/board/Coords.ts";
import type CastlingRights from "@/game/CastlingRights.ts";
import type ChessGame from "@/game/ChessGame.ts";
import GameResults from "@/game/GameResults.ts";
import type Position from "@/game/Position.ts";
import type Move from "@/moves/Move.ts";
import type Piece from "@/pieces/Piece.ts";

export type {
  Board, CastlingRights, ChessGame, Color, Coords, Move, Piece, Position
};

export interface PieceOffsets {
  x: number[];
  y: number[];
}

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

export interface PositionConstructorArgs {
  activeColor: Color;
  board: Board;
  castlingRights: CastlingRights;
  enPassantCoords: Coords | null;
  fullMoveNumber: number;
  halfMoveClock: number;
}

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
  Date: string | Date;
  EventDate: string | Date;
  Round: number;
  TimeControl: string;
  FEN: string;
  ECO: string;
  Opening: string;
  Variation: string;
  PlyCount: number;
  SetUp: number;
  Termination: string;
  WhiteElo: number;
  BlackElo: number;
  BlackTitle: string;
  WhiteTitle: string;
}

export type GameResult = typeof GameResults[keyof typeof GameResults];