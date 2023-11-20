import Colors from "$src/constants/Colors.ts";
import Piece from "$src/pieces/Piece.ts";
import Bishop from "$src/pieces/long-range/Bishop.ts";
import Queen from "$src/pieces/long-range/Queen.ts";
import Rook from "$src/pieces/long-range/Rook.ts";
import King from "$src/pieces/short-range/King.ts";
import Knight from "$src/pieces/short-range/Knight.ts";
import Pawn from "$src/pieces/short-range/Pawn.ts";
import { PieceInitial } from "$src/typings/types.ts";

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

  whitePieces(): Piece[] {
    return whitePieces;
  },

  blackPieces(): Piece[] {
    return blackPieces;
  },

  allPieces(): Piece[] {
    return allPieces;
  }
};

export default Pieces;