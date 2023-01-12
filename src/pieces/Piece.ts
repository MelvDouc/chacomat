import Piece from "./_Piece.js";
import King from "./King.js";
import Knight from "./Knight.js";
import Pawn from "./Pawn.js";
import Bishop from "./sliding/Bishop.js";
import Queen from "./sliding/Queen.js";
import Rook from "./sliding/Rook.js";

// @ts-ignore
Queen.offsets = {
  x: Rook.offsets.x.concat(Bishop.offsets.x),
  y: Rook.offsets.y.concat(Bishop.offsets.y)
};
// @ts-ignore
King.offsets = Queen.offsets;

Piece.constructors
  .set(King.whiteInitial, King)
  .set(Pawn.whiteInitial, Pawn)
  .set(Knight.whiteInitial, Knight)
  .set(Bishop.whiteInitial, Bishop)
  .set(Rook.whiteInitial, Rook)
  .set(Queen.whiteInitial, Queen);

export {
  Pawn,
  King,
  Knight,
  Bishop,
  Rook,
  Queen
};

export default Piece;