import { Color, GameStatus, WhitePieceInitial, Wing } from "@chacomat/utils/constants.js";

export type {
  Color,
  GameStatus,
  WhitePieceInitial,
  Wing
};

/**
 * https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation for more info.
 */
export type FenString = string;
export type Chess960FenString = string;
// export type WhitePieceInitial = "N" | "B" | "R" | "Q" | "K" | "P";
export type BlackPieceInitial = Lowercase<WhitePieceInitial>;
export type PieceInitial = WhitePieceInitial | BlackPieceInitial;
export type PromotedPieceInitial = Exclude<WhitePieceInitial, "K" | "P">;
export type ChessFileName = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
export type ChessRankName = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
export type AlgebraicSquareNotation = `${ChessFileName}${ChessRankName}`;

export type ChessGame = import("./game/ChessGame.js").default;
export type Chess960Game = import("./chess960/Chess960Game.js").default;

export type Position = import("./game/Position.js").default;
export type Chess960Position = import("./chess960/Chess960Position.js").default;

export type Board = import("./game/Board.js").default;
export type Chess960Board = import("./chess960/Chess960Board.js").default;

export type CastlingRights = import("./game/CastlingRights.js").default;
export type Chess960CastlingRights = import("./chess960/Chess960CastlingRights.js").default;

export type Coords = import("./game/Coords.js").default;
export type CoordsGenerator = Generator<Coords, void, unknown>;
export type Move = [Coords, Coords];

export type Piece = import("./pieces/index.js").default;
export type Pawn = import("./pieces/index.js").Pawn;
export type Knight = import("./pieces/index.js").Knight;
export type King = import("./pieces/index.js").King;
export type Rook = import("./pieces/index.js").Rook;
export type Bishop = import("./pieces/index.js").Bishop;
export type Queen = import("./pieces/index.js").Queen;

export type BlackAndWhite<T> = {
  [K in Color]: T;
};

export type Wings<T> = {
  [W in Wing]: T;
};

export interface ChessGameParameters {
  fenString?: FenString;
  positionInfo?: PositionInfo;
  metaInfo?: Partial<ChessGameMetaInfo>;
}
/**
 * Various info that would typically be found in a PGN file.
 */
export interface ChessGameMetaInfo {
  whitePlayer: string;
  blackPlayer: string;
  /**
   * Should be in the format `YYYY.MM.DD`.
   */
  date: string;
  event: string;
}

/**
 * The six items of information found in an FEN string.
 */
export interface PositionInfo {
  board: Board;
  castlingRights: CastlingRights;
  colorToMove: Color;
  enPassantFile: number;
  halfMoveClock: number;
  fullMoveNumber: number;
}

export interface PieceInfo {
  color: Color;
  board?: Board;
  coords?: Coords;
}