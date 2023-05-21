import Colors from "@src/constants/Colors.js";
import Coords from "@src/constants/Coords.js";
import { GameResults } from "@src/constants/GameStatus.js";
import Piece, { PiecesByName } from "@src/constants/Piece.js";
import Board from "@src/game/Board.js";
import ChessGame from "@src/game/ChessGame.js";
import Position from "@src/game/Position.js";

export type {
  Board,
  ChessGame,
  Piece,
  Position
};

export type Color = typeof Colors[keyof typeof Colors];
export type Wing = -1 | 1;

export type PieceInitial = keyof typeof PiecesByName;
export type NonKingPiece = Piece.WHITE_PAWN | Piece.BLACK_PAWN | Piece.KNIGHT | Piece.BISHOP | Piece.ROOK | Piece.QUEEN;
export type PromotedPiece = Piece.QUEEN | Piece.ROOK | Piece.BISHOP | Piece.KNIGHT;

export type HalfMove = [Coordinates, Coordinates];
export type HalfMoveWithPromotion = [...HalfMove, PromotedPiece?];

export type AlgebraicNotation = keyof typeof Coords;
export type CastlingRights = Record<Color, Set<number>>;
export type GameResult = typeof GameResults[keyof typeof GameResults];

export interface Coordinates {
  readonly x: number;
  readonly y: number;
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