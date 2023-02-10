import Chess960Board from "@chacomat/chess960/Chess960Board.js";
import Chess960CastlingRights from "@chacomat/chess960/Chess960CastlingRights.js";
import { getChess960PiecePlacement } from "@chacomat/chess960/random-placements.js";
import Position from "@chacomat/game/Position.js";
import Piece from "@chacomat/pieces/Piece.js";
import type {
  Chess960Game, Coords, PositionParameters
} from "@chacomat/types.local.js";

export default class Chess960Position extends Position {
  static override CastlingRights = Chess960CastlingRights;
  static override Board = Chess960Board;

  static getStartPositionInfo(): PositionParameters {
    const piecePlacement = getChess960PiecePlacement();
    const castlingRights = new Chess960CastlingRights();
    castlingRights.WHITE.push(...piecePlacement.R);
    castlingRights.BLACK.push(...piecePlacement.R);

    return {
      board: this.Board.create(piecePlacement),
      castlingRights,
      enPassantY: -1,
      colorToMove: "WHITE",
      halfMoveClock: 0,
      fullMoveNumber: 1
    };
  }

  override readonly board: Chess960Board;
  override readonly castlingRights: Chess960CastlingRights;
  override game: Chess960Game;

  override isCastling(king: Piece, destCoords: Coords): boolean {
    const possibleRook = this.board.get(destCoords);
    return possibleRook?.pieceName === "Rook" && possibleRook.color === king.color;
  }

  override *castlingCoords() {
    yield* this.board.kings[this.colorToMove].castlingCoords(true);
  }
}