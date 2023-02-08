import ChessGame from "./game/ChessGame.js";
import Piece, {
  Bishop, King, Knight, Pawn, Queen, Rook
} from "./pieces/index.js";

export type {
  ChessGame,
  GameParameters,
  Piece,
  Pawn,
  Knight,
  Bishop,
  Rook,
  Queen,
  King
};

/**
 * https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation for more info.
 */
export type FenString = string;

export type ChessFileName = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
export type ChessRankName = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
export type AlgebraicSquareNotation = `${ChessFileName}${ChessRankName}`;

export type Position = import("./game/Position.js").default;
export type Board = import("./game/Board.js").default;
export type CastlingRights = import("./game/CastlingRights.js").default;

export type Chess960Game = import("./chess960/Chess960Game.js").default;
export type Chess960Position = import("./chess960/Chess960Position.js").default;
export type Chess960CastlingRights = import("./chess960/Chess960CastlingRights.js").default;

export type Color = "WHITE" | "BLACK";
export type Wing = 0 | 7;

export type PieceName = "Pawn" | "Knight" | "Bishop" | "Rook" | "Queen" | "King";
export type WhitePieceInitial = "P" | "N" | "B" | "R" | "Q" | "K";
export type BlackPieceInitial = Lowercase<WhitePieceInitial>;
export type PieceInitial = WhitePieceInitial | BlackPieceInitial;
export type PromotedPieceType = Exclude<WhitePieceInitial, "P" | "K">;
export type NonPawnPieceType = Exclude<WhitePieceInitial, "P">;

export type IndexGenerator = Generator<number, void, unknown>;
export type Move = [number, number];

export interface PieceOffsets {
  x: number[];
  y: number[];
}

export type GameMetaInfo = Partial<FullGameMetaInfo>;

export type BlackAndWhite<T> = {
  [K in Color]: T;
};

export type Wings<T> = {
  [W in Wing]: T;
};

export interface Coords {
  x: number;
  y: number;
}

interface GameParameters {
  /**
   * If the parameters contain this property, then `positionParams` will be ignored.
   */
  pgn?: string;
}

interface GameParameters {
  /**
   * If the parameters contain this property, then `positionParams` will be ignored.
   */
  fen?: FenString;
}

interface GameParameters {
  positionParams?: PositionParameters;
  metaInfo?: GameMetaInfo;
}

/**
 * The six items of information found in an FEN string.
 */
export interface PositionParameters {
  board: Board;
  castlingRights: CastlingRights;
  colorToMove: Color;
  enPassantIndex: number;
  halfMoveClock: number;
  fullMoveNumber: number;
}

/**
 * Various Pascal-cased info that would typically be found in a PGN file.
 */
export interface FullGameMetaInfo {
  White: string;
  Black: string;
  Result: "1-0" | "0-1" | "0-0" | "1/2-1/2" | "*";
  FEN: string;
  WhiteElo: number;
  BlackElo: number;
  WhiteTeam: string;
  BlackTeam: string;
  Event: string;
  Site: string;
  Round: number;
  /**
   * Should be in the format `YYYY.MM.DD`.
  */
  Date: string;
  TimeControl: string;
  ECO: string;
  Opening: string;
  Variation: string;
  PlyCount: number;
  Annotator: string;
  [x: string]: unknown;
}


export interface PgnVariations {
  movesStr: string;
  variations?: PgnVariations[];
}