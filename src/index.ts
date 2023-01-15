import ChessGame from "@chacomat/game/ChessGame.js";
import Chess960Game from "@chacomat/chess960/Chess960Game.js";

export {
  ChessGame,
  Chess960Game
};

export type {
  FenString,
  WhitePieceInitial,
  BlackPieceInitial,
  PieceInitial,
  PromotedPieceInitial,
  AlgebraicSquareNotation,
  Color,
  GameStatus,
  Wing,
  Wings,
  BlackAndWhite,
  ChessGameParameters,
  ChessGameMetaInfo,
  Position,
  PositionInfo,
  Chess960Position,
  Board,
  Chess960Board,
  CastlingRights,
  Coords,
  Move,
  Piece,
  PieceInfo,
  Pawn,
  Knight,
  King,
  Rook,
  Bishop,
  Queen
} from "@chacomat/types.js";