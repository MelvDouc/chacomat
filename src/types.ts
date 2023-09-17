// deno-lint-ignore-file no-explicit-any
import BaseBoard from "@/base/BaseBoard.ts";
import type BasePosition from "@/base/BasePosition.ts";
import type Move from "@/base/moves/Move.ts";
import GameResults from "@/constants/GameResults.ts";

export type { Move };
export type MoveObject = ReturnType<Move["toObject"]>;

export interface PieceOffsets {
  x: number[];
  y: number[];
}

export type GameResult = typeof GameResults[keyof typeof GameResults];

export type GameInfo = Partial<BaseGameInfo> & {
  Result: GameResult;
  [key: string]: any;
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

export type BasePositionObject = ReturnType<BasePosition<BaseBoard>["toObject"]>;

export interface ShatranjPositionObject extends BasePositionObject {
  FEN: string;
  prev: ShatranjPositionObject | null;
  next: { move: MoveObject; position: ShatranjPositionObject; }[];
  legalMoves: MoveObject[];
}