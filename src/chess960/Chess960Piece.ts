import Piece from "@chacomat/pieces/index.js";
import Chess960King from "@chacomat/chess960/Chess960King.js";

class Chess960Piece extends Piece { };

Chess960Piece.constructors.set(Piece.WHITE_PIECE_INITIALS.KING, Chess960King);

export default Chess960Piece;