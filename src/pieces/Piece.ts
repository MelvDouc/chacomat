import Piece from "./_Piece.js";
import King from "./King.js";
import Knight from "./Knight.js";
import Pawn from "./Pawn.js";
import Bishop from "./sliding/Bishop.js";
import Queen from "./sliding/Queen.js";
import Rook from "./sliding/Rook.js";

Piece.constructors
  .set(King.initial, King)
  .set(Pawn.initial, Pawn)
  .set(Knight.initial, Knight)
  .set(Bishop.initial, Bishop)
  .set(Rook.initial, Rook)
  .set(Queen.initial, Queen);

export {
  Pawn,
  King,
  Knight,
  Bishop,
  Rook,
  Queen
};

export default Piece;