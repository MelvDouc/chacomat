import ShatranjBoard from "@/variants/shatranj/ShatranjBoard.ts";
import ShatranjPiece from "@/variants/shatranj/ShatranjPiece.ts";
import { assert, assertEquals } from "@dev_deps";

Deno.test("string to board", () => {
  const board = new ShatranjBoard().addPiecesFromString("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  const blackPieceRank = Array.from({ length: 8 }, (_, y) => board.get(board.coords(0, y)));
  const whitePieceRank = Array.from({ length: 8 }, (_, y) => board.get(board.coords(7, y)));
  assert(whitePieceRank.every((piece, i) => blackPieceRank[i] === piece?.opposite));
});

Deno.test("board to string", () => {
  const board = new ShatranjBoard();

  for (let y = 0; y < 8; y++) {
    board.set(board.coords(1, y), ShatranjPiece.Pieces.BLACK_PAWN);
    board.set(board.coords(6, y), ShatranjPiece.Pieces.WHITE_PAWN);
  }

  assertEquals(board.toString(), "8/pppppppp/8/8/8/8/PPPPPPPP/8");
});