import King from "@chacomat/pieces/King.js";
import Knight from "@chacomat/pieces/Knight.js";
import Pawn from "@chacomat/pieces/Pawn.js";
import Piece from "@chacomat/pieces/Piece.js";
import Bishop from "@chacomat/pieces/sliding/Bishop.js";
import Queen from "@chacomat/pieces/sliding/Queen.js";
import Rook from "@chacomat/pieces/sliding/Rook.js";

Piece.pieceClassesByInitial
  .set("P", Pawn)
  .set("N", Knight)
  .set("B", Bishop)
  .set("R", Rook)
  .set("Q", Queen)
  .set("K", King);

Piece.pieceInitialsByClass
  .set(Pawn, "P")
  .set(Knight, "N")
  .set(Bishop, "B")
  .set(Rook, "R")
  .set(Queen, "Q")
  .set(King, "K");

export {
  Pawn,
  Knight,
  Bishop,
  Rook,
  Queen,
  King
};

export default Piece;