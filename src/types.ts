import type { GameStatus, PieceType, Wing } from "@chacomat/utils/constants.js";

export type {
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

export type Color = import("./utils/Color.js").default;

export type Piece = import("./pieces/Piece.js").default;
export type BlackPieceInitial = Lowercase<PieceType>;
export type PieceInitial = PieceType | BlackPieceInitial;
export type PromotedPieceType = Exclude<PieceType, PieceType.KING | PieceType.PAWN>;
export type NonPawnPieceType = Exclude<PieceType, PieceType.PAWN>;

export type Coords = {
  readonly x: number;
  readonly y: number;
  get notation(): AlgebraicSquareNotation;
  getPeer: (xOffset: number, yOffset: number) => Coords | null;
};
export type CoordsGenerator = Generator<Coords, void, unknown>;
export type Move = [Coords, Coords];

export type BlackAndWhite<T> = {
  [K in Color]: T;
};

export type Wings<T> = {
  [W in Wing]: T;
};

export interface PieceOffsets {
  x: number[];
  y: number[];
}

export interface ChessGameParameters {
  fenString?: FenString;
  positionInfo?: PositionParameters;
  metaInfo?: Partial<ChessGameMetaInfo>;
}
/**
 * Various info that would typically be found in a PGN file.
 */
export interface ChessGameMetaInfo {
  whitePlayer: string;
  blackPlayer: string;
  whiteElo: number;
  blackElo: number;
  whiteTeam: string;
  blackTeam: string;
  event: string;
  site: string;
  /**
   * Should be in the format `YYYY.MM.DD`.
  */
  date: string;
  ECO: string;
  [x: string]: any;
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
  coords?: Coords;
}