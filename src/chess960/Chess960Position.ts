import Position from "@chacomat/game/Position.js";
import Chess960CastlingRights from "@chacomat/chess960/Chess960CastlingRights.js";
import type {
  Chess960Game,
  Coords,
  King
} from "@chacomat/types.js";

export default class Chess960Position extends Position {
  public static override CastlingRights = Chess960CastlingRights;
  protected static override readonly useChess960Castling = true;

  public override readonly castlingRights: Chess960CastlingRights;
  public override game: Chess960Game;

  protected override isCastling(king: King, destCoords: Coords): boolean {
    return !!this.board.get(destCoords)?.isRook()
      && this.board.get(destCoords)!.color === king.color;
  }
}