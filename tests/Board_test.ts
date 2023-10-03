import Board from "@/board/Board.ts";
import { coords } from "@/board/Coords.ts";
import PawnMove from "@/moves/PawnMove.ts";
import { Pieces } from "@/pieces/Piece.ts";
import { assert, assertEquals } from "@dev_deps";

Deno.test("string to board", () => {
  const board = Board.fromString("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  const blackPieceRank = Array.from({ length: 8 }, (_, y) => board.get(coords(0, y)));
  const whitePieceRank = Array.from({ length: 8 }, (_, y) => board.get(coords(8 - 1, y)));
  assert(whitePieceRank.every((piece, i) => blackPieceRank[i] === piece?.opposite));
});

Deno.test("board to string", () => {
  const board = new Board();

  for (let y = 0; y < 8; y++) {
    board.set(coords(1, y), Pieces.BLACK_PAWN);
    board.set(coords(6, y), Pieces.WHITE_PAWN);
  }

  assertEquals(board.toString(), "8/pppppppp/8/8/8/8/PPPPPPPP/8");
});

Deno.test("promotion", () => {
  const board = Board.fromString("8/P7/8/8/8/8/p7/5k1K");
  const whiteMove = new PawnMove(coords(1, 0), coords(0, 0), Pieces.WHITE_QUEEN);
  const blackMove = new PawnMove(coords(6, 0), coords(7, 0), Pieces.BLACK_QUEEN);

  assert(whiteMove.isPromotion(board));
  assert(blackMove.isPromotion(board));
});