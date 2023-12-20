export { default as Colors } from "$src/constants/Colors.ts";
export { default as SquareIndex } from "$src/constants/SquareIndex.ts";
export { default as ChessGame } from "$src/game/ChessGame.ts";
export { default as globalConfig } from "$src/global-config.ts";
export { default as Pieces } from "$src/pieces/Pieces.ts";
export { GameResults } from "pgnify";

export type {
  BlackPieceInitial,
  Board,
  CastlingRights,
  Color,
  ColorName,
  GameResult,
  JSONBoard,
  JSONCastlingRights,
  JSONPiece,
  JSONPosition,
  Move,
  NAG,
  NullMove,
  PGNHeaders,
  Piece,
  PieceInitial,
  Point,
  Position,
  RealMove,
  WhitePieceInitial,
  Wing
} from "$src/typings/types.ts";