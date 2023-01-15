import Chess960Piece from "@chacomat/chess960/Chess960Piece.js";
import Board from "@chacomat/game/Board.js";

export default class Chess960Board extends Board {
  public static override readonly Piece = Chess960Piece;
}