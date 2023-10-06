import Board from "@/board/Board.ts";
import Color from "@/board/Color.ts";
import { coords } from "@/board/Coords.ts";
import PawnMove from "@/moves/PawnMove.ts";
import { Pieces } from "@/pieces/Piece.ts";
import { assert, assertEquals } from "@dev_deps";

Deno.test("King in corner should attack 3 squares.", () => {
  const board = new Board();
  board.set(coords(0, 0), Pieces.WHITE_KING);
  board.set(coords(2, 0), Pieces.BLACK_KING);

  assertEquals(board.attackedCoordsSet(Color.WHITE).size, 3);
  assertEquals(board.attackedCoordsSet(Color.BLACK).size, 5);
});

Deno.test("Rook should always attacked 14 squares.", () => {
  const board = new Board();
  const x = Math.floor(Math.random() * 8);
  const y = Math.floor(Math.random() * 8);
  board.set(coords(x, y), Pieces.WHITE_ROOK);

  assertEquals(board.attackedCoordsSet(Color.WHITE).size, 14);
});

Deno.test("string to board", () => {
  const board = Board.fromString("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  const blackPieceRank = Array.from({ length: 8 }, (_, x) => board.get(coords(x, 0)));
  const whitePieceRank = Array.from({ length: 8 }, (_, x) => board.get(coords(x, 8 - 1)));
  assert(whitePieceRank.every((piece, i) => blackPieceRank[i] === piece?.opposite));
});

Deno.test("board to string", () => {
  const board = new Board();

  for (let x = 0; x < 8; x++) {
    board.set(coords(x, 1), Pieces.BLACK_PAWN);
    board.set(coords(x, 6), Pieces.WHITE_PAWN);
  }

  assertEquals(board.toString(), "8/pppppppp/8/8/8/8/PPPPPPPP/8");
});

Deno.test("promotion", () => {
  const whiteMove = new PawnMove(coords(0, 1), coords(0, 0), Pieces.WHITE_QUEEN);
  const blackMove = new PawnMove(coords(0, 6), coords(0, 7), Pieces.BLACK_QUEEN);

  assert(whiteMove.isPromotion());
  assert(blackMove.isPromotion());
});