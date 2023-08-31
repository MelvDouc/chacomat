import type ChessGame from "@game/ChessGame.js";
import type Position from "@game/Position.js";

export type Status = typeof Position["Status"][keyof typeof Position["Status"]];
export type Result = typeof ChessGame["Result"][keyof typeof ChessGame["Result"]];

export interface GameMetaData {
  Result: Result;
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
  [key: string]: any;
}