import Color from "./constants/Color.js";
import GameStatus from "./constants/GameStatus.js";

export type { Color, GameStatus };

export type FenString = string;
export type WhitePieceInitial = "N" | "B" | "R" | "Q" | "K" | "P";
export type BlackPieceInitial = Lowercase<WhitePieceInitial>;
export type PieceInitial = WhitePieceInitial | BlackPieceInitial;
export type Promotable = Exclude<WhitePieceInitial, "K" | "P">;
export type ChessFileName = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
export type ChessRankName = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
export type AlgebraicSquareNotation = `${ChessFileName}${ChessRankName}`;

export type Piece = import("./pieces/Piece.js").default;
export type Pawn = import("./pieces/Piece.js").Pawn;
export type King = import("./pieces/Piece.js").King;
export type Knight = import("./pieces/Piece.js").Knight;
export type Bishop = import("./pieces/Piece.js").Bishop;
export type Rook = import("./pieces/Piece.js").Rook;
export type Queen = import("./pieces/Piece.js").Queen;

export type ChessGame = import("./game/ChessGame.js").default;
export type Position = import("./game/Position.js").default;
export type Board = import("./game/Board.js").default;
export type CastlingRights = import("./game/CastlingRights.js").default;
export type CoordsGenerator = Generator<Coords, void, unknown>;
export type Move = [Coords, Coords];

export type BlackAndWhite<T> = {
  [K in Color]: T;
};

export type Coords = import("./game/Coords.js").default;

export interface PositionInfo {
  board: Board;
  castlingRights: CastlingRights;
  colorToMove: Color;
  enPassantFile: number;
  halfMoveClock: number;
  fullMoveNumber: number;
}