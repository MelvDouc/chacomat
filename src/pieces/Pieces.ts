import Color from "$src/game/Color.js";
import Piece from "$src/pieces/Piece.js";
import Bishop from "$src/pieces/long-range/Bishop.js";
import Queen from "$src/pieces/long-range/Queen.js";
import Rook from "$src/pieces/long-range/Rook.js";
import King from "$src/pieces/short-range/King.js";
import Knight from "$src/pieces/short-range/Knight.js";
import Pawn from "$src/pieces/short-range/Pawn.js";
import type { PieceInitial } from "$src/types.js";

const WHITE_PAWN = new Pawn(1, Color.White, "P");
const WHITE_KNIGHT = new Knight(2, Color.White, "N");
const WHITE_KING = new King(3, Color.White, "K");
const WHITE_BISHOP = new Bishop(4, Color.White, "B");
const WHITE_ROOK = new Rook(5, Color.White, "R");
const WHITE_QUEEN = new Queen(6, Color.White, "Q");
const BLACK_PAWN = new Pawn(-1, Color.Black, "p");
const BLACK_KNIGHT = new Knight(-2, Color.Black, "n");
const BLACK_KING = new King(-3, Color.Black, "k");
const BLACK_BISHOP = new Bishop(-4, Color.Black, "b");
const BLACK_ROOK = new Rook(-5, Color.Black, "r");
const BLACK_QUEEN = new Queen(-6, Color.Black, "q");

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