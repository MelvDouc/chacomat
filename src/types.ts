import Colors from "@src/constants/Colors.js";
import { Coords } from "@src/constants/Coords.js";
import { GameResults } from "@src/constants/GameStatus.js";
import Piece from "@src/constants/Piece.js";
import PieceMap from "@src/game/PieceMap.js";

export type {
  Piece,
  PieceMap
};

export type AlgebraicNotation = keyof typeof Coords;
export type Color = typeof Colors[keyof typeof Colors];
export type CastlingRights = Record<Color, Set<number>>;
export type GameResult = typeof GameResults[keyof typeof GameResults];
export type HalfMove = [Coordinates, Coordinates];
export type HalfMoveWithPromotion = [...HalfMove, PromotedPiece?];
export type PromotedPiece = Piece.QUEEN | Piece.ROOK | Piece.BISHOP | Piece.KNIGHT;
export type Wing = -1 | 1;

export interface Coordinates {
  readonly x: number;
  readonly y: number;
}

export interface PositionInfo {
  pieces: Record<Color, PieceMap>;
  activeColor: Color;
  /** Contains initial rook files. */
  castlingRights: CastlingRights;
  enPassantCoords: Coordinates | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  boardStr?: string;
}

export interface GameMetaInfo {
  White: string;
  Black: string;
  Result: GameResult;
  FEN: string;
  WhiteElo: number;
  BlackElo: number;
  WhiteTeam: string;
  BlackTeam: string;
  Event: string;
  Site: string;
  Round: number;
  /** Should be in the format `YYYY.MM.DD`. */
  Date: string;
  TimeControl: string;
  ECO: string;
  Opening: string;
  Variation: string;
  Termination: string;
  PlyCount: number;
  Annotator: string;
  [x: string]: unknown;
}