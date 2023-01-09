import Color from "./constants/Color.js";
import GameStatus from "./constants/GameStatus.js";
import type { ICastlingRights } from "./game/CastlingRights.js";

export type { Color, GameStatus, ICastlingRights };
export type ChessRank = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ChessFile = ChessRank;

export type FenString = string;
export type WhitePieceInitial = "N" | "B" | "R" | "Q" | "K" | "P";
export type BlackPieceInitial = Lowercase<WhitePieceInitial>;
export type PieceInitial = WhitePieceInitial | BlackPieceInitial;
export type Promotable = Exclude<WhitePieceInitial, "K" | "P">;
export type ChessFileName = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
export type ChessRankName = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
export type AlgebraicSquareNotation = `${ChessFileName}${ChessRankName}`;

export type Piece = import("./pieces/Piece.js").default;
export type ChessGame = import("./game/ChessGame.js").default;
export type Position = import("./game/Position.js").default;
export type Board = import("./game/Board.js").default;
export type AttackedCoordsRecord = Record<number, Record<number, true>>;
export type CoordsGenerator = Generator<Coords, void, unknown>;
export type Move = [Coords, Coords];

export type BlackAndWhite<T> = {
  [K in Color]: T;
};

export interface Coords {
  x: number;
  y: number;
}

export interface PositionInfo {
  board: Board;
  castlingRights: ICastlingRights;
  colorToMove: Color;
  enPassantFile: number;
  halfMoveClock: number;
  fullMoveNumber: number;
}
