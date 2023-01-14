import Piece from "@pieces/Piece.js";
import Pawn from "@pieces/Pawn.js";
import Knight from "@pieces/Knight.js";
import King from "@pieces/King.js";
import Bishop from "@pieces/sliding/Bishop.js";
import Rook from "@pieces/sliding/Rook.js";
import Queen from "@pieces/sliding/Queen.js";

Piece.constructors
  .set(Pawn.whiteInitial, Pawn)
  .set(Knight.whiteInitial, Knight)
  .set(King.whiteInitial, King)
  .set(Bishop.whiteInitial, Bishop)
  .set(Rook.whiteInitial, Rook)
  .set(Queen.whiteInitial, Queen);

export {
  Pawn,
  Knight,
  King,
  Bishop,
  Rook,
  Queen
};

export default Piece;