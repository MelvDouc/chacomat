import GameStatus from "./constants/GameStatus.js";
import PieceType from "./constants/PieceType.js";
import Wing from "./constants/Wing.js";

export type {
  GameParameters,
  GameStatus,
  PieceType,
  Wing
};

/**
 * https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation for more info.
 */
export type FenString = string;

export type ChessFileName = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
export type ChessRankName = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
export type AlgebraicSquareNotation = `${ChessFileName}${ChessRankName}`;

export type ChessGame = import("./game/ChessGame.js").default;
export type Position = import("./game/Position.js").default;
export type Board = import("./game/Board.js").default;
export type CastlingRights = import("./game/CastlingRights.js").default;

export type Chess960Game = import("./chess960/Chess960Game.js").default;
export type Chess960Position = import("./chess960/Chess960Position.js").default;
export type Chess960CastlingRights = import("./chess960/Chess960CastlingRights.js").default;

export type Color = import("./constants/Color.js").default;

export type Piece = import("./pieces/Piece.js").default;
export type BlackPieceInitial = Lowercase<PieceType>;
export type PieceInitial = PieceType | BlackPieceInitial;
export type PromotedPieceType = Exclude<PieceType, PieceType.KING | PieceType.PAWN>;
export type NonPawnPieceType = Exclude<PieceType, PieceType.PAWN>;

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
  enPassantFile: number;
  halfMoveClock: number;
  fullMoveNumber: number;
}

export interface PieceParameters {
  color: Color;
  type: PieceType;
  board?: Board;
  index?: number;
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