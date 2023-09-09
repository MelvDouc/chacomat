import GameResults from "@/constants/GameResults.ts";
import PositionStatuses from "@/constants/PositionStatuses.ts";
import Board from "@/game/Board.ts";
import CastlingRights from "@/game/CastlingRights.ts";
import ChessGame from "@/game/ChessGame.ts";
import Color from "@/game/Color.ts";
import Piece from "@/game/Piece.ts";
import CapablancaChessGame from "@/variants/capablanca-chess/CapablancaChessGame.ts";
import Chess960Game from "@/variants/chess960/Chess960Game.ts";

export * as ChacoMatTypes from "@/types/main-types.ts";
export {
  Board, CapablancaChessGame, CastlingRights, Chess960Game,
  ChessGame, Color, GameResults, Piece, PositionStatuses
};
