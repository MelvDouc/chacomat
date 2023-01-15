import Piece from "@chacomat/pieces/Piece.js";
import Pawn from "@chacomat/pieces/Pawn.js";
import Knight from "@chacomat/pieces/Knight.js";
import King from "@chacomat/pieces/King.js";
import Bishop from "@chacomat/pieces/sliding/Bishop.js";
import Rook from "@chacomat/pieces/sliding/Rook.js";
import Queen from "@chacomat/pieces/sliding/Queen.js";

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