import Piece from "@pieces/Piece.js";

export default class Knight extends Piece {
  public static override readonly WHITE_INITIAL = Piece.WHITE_PIECE_INITIALS.KNIGHT;
  protected static override readonly OFFSETS = {
    x: [-2, -2, -1, -1, 1, 1, 2, 2],
    y: [-1, 1, -2, 2, -2, 2, -1, 1]
  };
}