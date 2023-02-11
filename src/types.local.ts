// ===== ===== ===== ===== =====
// STRING TYPES
// ===== ===== ===== ===== =====

/**
 * https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation for more info.
 */
export type FenString = string;
export type ChessFileName = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
export type ChessRankName = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
export type AlgebraicSquareNotation = `${ChessFileName}${ChessRankName}`;
export type PieceName = "Pawn" | "Knight" | "Bishop" | "Rook" | "Queen" | "King";
export type WhitePieceInitial = "P" | "N" | "B" | "R" | "Q" | "K";
export type BlackPieceInitial = Lowercase<WhitePieceInitial>;
export type PieceInitial = WhitePieceInitial | BlackPieceInitial;
export type PromotedPieceType = Exclude<WhitePieceInitial, "P" | "K">;
export type NonPawnPieceType = Exclude<WhitePieceInitial, "P">;

// ===== ===== ===== ===== =====
// CHESS GAME
// ===== ===== ===== ===== =====

export type ChessGame = import("./game/ChessGame.js").default;

export interface GameParameters {
  /**
   * If the parameters contain this property, then `positionParams` will be ignored.
   */
  pgn?: string;
  /**
   * If the parameters contain this property, then `positionParams` will be ignored.
   */
  fen?: FenString;
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
  enPassantY: number;
  halfMoveClock: number;
  fullMoveNumber: number;
}

// ===== ===== ===== ===== =====
// GAME COMPONENTS
// ===== ===== ===== ===== =====

export type Position = import("./game/Position.js").default;
export type Board = import("./game/Board.js").default;
export type CastlingRights = import("./game/CastlingRights.js").default;

// ===== ===== ===== ===== =====
// GAME CONSTANTS
// ===== ===== ===== ===== =====

export type Color = "WHITE" | "BLACK";
export type BlackAndWhite<T> = {
  [K in Color]: T;
};
export type Wing = 0 | 7;
export type Wings<T> = {
  [W in Wing]: T;
};

// ===== ===== ===== ===== =====
// COORDS
// ===== ===== ===== ===== =====

export type CoordsGenerator = Generator<Coords, void, unknown>;
export type Move = [Coords, Coords];
type MoveMatch = Record<string, string | undefined>;
export type MoveFinder = (match: MoveMatch, board: Board, legalMoves?: Move[]) => ([...Move, PromotedPieceType?] | null | undefined);

export interface PieceOffsets {
  x: number[];
  y: number[];
}

export interface Coords {
  readonly x: number;
  readonly y: number;
  get notation(): AlgebraicSquareNotation;
  getPeer(xOffset: number, yOffset: number): Coords | null;
}

// ===== ===== ===== ===== =====
// PIECES
// ===== ===== ===== ===== =====

export type Piece = import("./pieces/Piece.js").default;
export type Pawn = import("./pieces/Pawn.js").default;
export type Knight = import("./pieces/Knight.js").default;
export type King = import("./pieces/King.js").default;
export type Bishop = import("./pieces/sliding/Bishop.js").default;
export type Rook = import("./pieces/sliding/Rook.js").default;
export type Queen = import("./pieces/sliding/Queen.js").default;

// ===== ===== ===== ===== =====
// PGN
// ===== ===== ===== ===== =====

export type GameMetaInfo = Partial<FullGameMetaInfo>;

export interface PgnVariations {
  movesAsString: string;
  variations?: PgnVariations[];
}

/**
 * Various Pascal-cased info that would typically be found in a PGN file.
 */
interface FullGameMetaInfo {
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

// ===== ===== ===== ===== =====
// CHESS960
// ===== ===== ===== ===== =====

export type Chess960Game = import("./chess960/Chess960Game.js").default;
export type Chess960Position = import("./chess960/Chess960Position.js").default;
export type Chess960CastlingRights = import("./chess960/Chess960CastlingRights.js").default;