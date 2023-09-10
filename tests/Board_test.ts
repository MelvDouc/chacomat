import ShatranjBoard from "@/variants/shatranj/ShatranjBoard.ts";
import ShatranjPiece from "@/variants/shatranj/ShatranjPiece.ts";
import { assert, assertEquals } from "@dev_deps";

Deno.test("string to board", () => {
  const board = new ShatranjBoard().addPiecesFromString("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  const blackPieceRank = Array.from({ length: 8 }, (_, i) => board.get(i));
  const whitePieceRank = Array.from({ length: 8 }, (_, i) => board.get(8 * 7 + i));
  assert(whitePieceRank.every((piece, i) => blackPieceRank[i] === piece?.opposite));
});

Deno.test("board to string", () => {
  const board = new ShatranjBoard();

  for (let i = 0; i < 8; i++) {
    board.set(8 + i, ShatranjPiece.Pieces.BLACK_PAWN);
    board.set(8 * 6 + i, ShatranjPiece.Pieces.WHITE_PAWN);
  }

  assertEquals(board.toString(), "8/pppppppp/8/8/8/8/PPPPPPPP/8");
});