import Piece from "./Piece.js";
import Pawn from "./Pawn.js";
import Knight from "./Knight.js";
import King from "./King.js";
import Bishop from "./sliding/Bishop.js";
import Rook from "./sliding/Rook.js";
import Queen from "./sliding/Queen.js";

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