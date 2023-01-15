import Piece from "@pieces/Piece.js";
import Pawn from "@pieces/Pawn.js";
import Knight from "@pieces/Knight.js";
import King from "@pieces/King.js";
import Bishop from "@pieces/sliding/Bishop.js";
import Rook from "@pieces/sliding/Rook.js";
import Queen from "@pieces/sliding/Queen.js";

Piece.constructors
  .set(Pawn.WHITE_INITIAL, Pawn)
  .set(Knight.WHITE_INITIAL, Knight)
  .set(King.WHITE_INITIAL, King)
  .set(Bishop.WHITE_INITIAL, Bishop)
  .set(Rook.WHITE_INITIAL, Rook)
  .set(Queen.WHITE_INITIAL, Queen);

export {
  Pawn,
  Knight,
  King,
  Bishop,
  Rook,
  Queen
};

export default Piece;