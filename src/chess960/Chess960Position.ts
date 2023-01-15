import Position from "@chacomat/game/Position.js";
import Chess960Board from "@chacomat/chess960/Chess960Board.js";
import Chess960CastlingRights from "@chacomat/chess960/Chess960CastlingRights.js";
import type {
  Chess960Game
} from "@chacomat/types.js";
import Coords from "../game/Coords.js";
import King from "../pieces/King.js";

export default class Chess960Position extends Position {
  public static override Board = Chess960Board;
  public static override CastlingRights = Chess960CastlingRights;

  public override readonly board: Chess960Board;
  public override readonly castlingRights: Chess960CastlingRights;
  public override game: Chess960Game;

  protected static override isCastling(king: King, destCoords: Coords): boolean {
    return !!king.board.get(destCoords)?.isRook()
      && king.board.get(destCoords)!.color === king.color;
  }
}