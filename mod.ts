import Color from "@/constants/Color.ts";
import GameResults from "@/constants/GameResults.ts";
import PositionStatuses from "@/constants/PositionStatuses.ts";
import Board from "@/international/Board.ts";
import CastlingRights from "@/international/CastlingRights.ts";
import ChessGame from "@/international/ChessGame.ts";
import Piece from "@/international/Piece.ts";
import CapablancaChessGame from "@/variants/capablanca-chess/CapablancaChessGame.ts";
import Chess960Game from "@/variants/chess960/Chess960Game.ts";
import ShatranjGame from "@/variants/shatranj/ShatranjGame.ts";

export * as ChacoMatTypes from "@/types/main-types.ts";
export {
  Board,
  CapablancaChessGame,
  CastlingRights,
  Chess960Game, ChessGame, Color,
  GameResults,
  Piece,
  PositionStatuses, ShatranjGame
};
