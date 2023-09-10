import Color from "@/constants/Color.ts";
import GameResults from "@/constants/GameResults.ts";
import PositionStatuses from "@/constants/PositionStatuses.ts";
import type ChessGame from "@/international/ChessGame.ts";
import type Position from "@/international/Position.ts";
import * as Json from "@/types/json-types.ts";
import type ShatranjBoard from "@/variants/shatranj/ShatranjBoard.ts";

export {
  Json, type ChessGame, type Color,
  type Position
};

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
  toJson(): Json.Coords;
}

export interface Move {
  readonly srcCoords: Coordinates;
  readonly destCoords: Coordinates;
  /**
   * Play the move on the board.
   * @param board The move to apply the move to.
   * @returns An undo function.
  */
  try(board: ShatranjBoard): () => void;
  getComputerNotation(): string;
  getAlgebraicNotation(board: ShatranjBoard, legalMoves: Move[]): string;
  toJson(board: ShatranjBoard, legalMoves: Move[]): Json.Move;
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
export type PositionStatus = typeof PositionStatuses[keyof typeof PositionStatuses];