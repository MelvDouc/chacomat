import Colors from "$src/constants/Colors";
import Piece from "$src/pieces/Piece";
import Bishop from "$src/pieces/long-range/Bishop";
import Queen from "$src/pieces/long-range/Queen";
import Rook from "$src/pieces/long-range/Rook";
import King from "$src/pieces/short-range/King";
import Knight from "$src/pieces/short-range/Knight";
import Pawn from "$src/pieces/short-range/Pawn";
import { PieceInitial } from "$src/typings/types";

const WHITE_PAWN = new Pawn(1, Colors.WHITE, "P");
const WHITE_KNIGHT = new Knight(2, Colors.WHITE, "N");
const WHITE_KING = new King(3, Colors.WHITE, "K");
const WHITE_BISHOP = new Bishop(4, Colors.WHITE, "B");
const WHITE_ROOK = new Rook(5, Colors.WHITE, "R");
const WHITE_QUEEN = new Queen(6, Colors.WHITE, "Q");
const BLACK_PAWN = new Pawn(-1, Colors.BLACK, "p");
const BLACK_KNIGHT = new Knight(-2, Colors.BLACK, "n");
const BLACK_KING = new King(-3, Colors.BLACK, "k");
const BLACK_BISHOP = new Bishop(-4, Colors.BLACK, "b");
const BLACK_ROOK = new Rook(-5, Colors.BLACK, "r");
const BLACK_QUEEN = new Queen(-6, Colors.BLACK, "q");

const whitePieces = [
  WHITE_PAWN,
  WHITE_KNIGHT,
  WHITE_KING,
  WHITE_BISHOP,
  WHITE_ROOK,
  WHITE_QUEEN
];

const blackPieces = [
  BLACK_PAWN,
  BLACK_KNIGHT,
  BLACK_KING,
  BLACK_BISHOP,
  BLACK_ROOK,
  BLACK_QUEEN
];

const allPieces = [
  ...whitePieces,
  ...blackPieces
];

const Pieces = {
  WHITE_PAWN,
  WHITE_KNIGHT,
  WHITE_KING,
  WHITE_BISHOP,
  WHITE_ROOK,
  WHITE_QUEEN,
  BLACK_PAWN,
  BLACK_KNIGHT,
  BLACK_KING,
  BLACK_BISHOP,
  BLACK_ROOK,
  BLACK_QUEEN,

  fromInitial(initial: string): Piece | null {
    return Piece.byInitial.get(initial as PieceInitial) ?? null;
  },

  whitePieces() {
    return whitePieces;
  },

  blackPieces() {
    return blackPieces;
  },

  allPieces() {
    return allPieces;
  }
};

export default Pieces;