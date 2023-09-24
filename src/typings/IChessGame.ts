import GameResults from "@/base/GameResults.ts";
import IMove from "@/typings/IMove.ts";
import IPosition from "@/typings/IPosition.ts";

export default interface IChessGame {
  readonly info: GameInfo;
  currentPosition: IPosition;
  get firstPosition(): IPosition;
  goBack(): void;
  goToStart(): void;
  goForward(): void;
  goToEnd(): void;
  playMove(move: IMove): IChessGame;
  playMoveWithNotation(notation: string): IChessGame;
  infoAsString(): string;
  moveListAsString(): string;
}

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

export type GameResult = typeof GameResults[keyof typeof GameResults];