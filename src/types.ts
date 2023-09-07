import GameResults from "@/constants/GameResults.ts";
import PositionStatuses from "@/constants/PositionStatuses.ts";

export type Status = typeof PositionStatuses[keyof typeof PositionStatuses];
export type Result = typeof GameResults[keyof typeof GameResults];
export type PromotionType = "Q" | "R" | "B" | "N";
export type CapablancaChessPromotionType = PromotionType | "A" | "C";

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
}