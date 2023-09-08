import GameResults from "@/constants/GameResults.ts";
import PositionStatuses from "@/constants/PositionStatuses.ts";
import Board from "@/impl/Board.ts";
import ChessGame from "@/impl/ChessGame.ts";
import Color from "@/impl/Color.ts";
import Position from "@/impl/Position.ts";
import * as JsonTypes from "@/types/JsonTypes.ts";

export {
  JsonTypes,
  type Board, type ChessGame, type Position
};

export type PositionStatus = typeof PositionStatuses[keyof typeof PositionStatuses];

export interface Coordinates {
  x: number;
  y: number;
  index: number;
  rankNotation: string;
  fileNotation: string;
  notation: string;
  getPeer(xOffset: number, yOffset: number): Coordinates | null;
  peers(xOffset: number, yOffset: number): Generator<Coordinates>;
  isLightSquare(): boolean;
  toJson(): JsonTypes.Coords;
}

export interface Figure {
  value: number;
  initial: string;
  offsets: { x: number[]; y: number[]; };
  color: Color;
  opposite: Figure;
  isPawn(): boolean;
  isKnight(): boolean;
  isBishop(): boolean;
  isRook(): boolean;
  isQueen(): boolean;
  isKing(): boolean;
  isShortRange(): boolean;
  toJson(): JsonTypes.Piece;
}

export interface Move {
  readonly srcCoords: Coordinates;
  readonly destCoords: Coordinates;
  /**
   * Play the move on the board.
   * @param board The move to apply the move to.
   * @returns An undo function.
  */
  try(board: Board): () => void;
  getComputerNotation(): string;
  getAlgebraicNotation(board: Board, legalMoves: Move[]): string;
  toJson(board: Board, legalMoves: Move[]): JsonTypes.Move;
}

export interface GameMetaData {
  Result: GameResult;
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
export type PromotionType = "Q" | "R" | "B" | "N";
export type CapablancaChessPromotionType = PromotionType | "A" | "C";