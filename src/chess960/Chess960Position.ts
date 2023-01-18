import Position from "@chacomat/game/Position.js";
import Chess960CastlingRights from "@chacomat/chess960/Chess960CastlingRights.js";
import type {
  Chess960Game,
  Coords,
  Piece
} from "@chacomat/types.js";

export default class Chess960Position extends Position {
  static override #CastlingRights = Chess960CastlingRights;
  static override readonly #useChess960Castling = true;

  override readonly castlingRights: Chess960CastlingRights;
  override game: Chess960Game;

  override #isCastling(king: Piece, destCoords: Coords): boolean {
    return !!this.board.get(destCoords)?.isRook()
      && this.board.get(destCoords)!.color === king.color;
  }
}