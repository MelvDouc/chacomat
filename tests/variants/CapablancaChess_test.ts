import { assertEquals } from "$dev_deps";
import CapablancaBoard from "@/variants/capablanca-chess/CapablancaBoard.ts";
import CapablancaPiece from "@/variants/capablanca-chess/CapablancaPiece.ts";

Deno.test("Board validity #1", () => {
  const boardStr = "rnabqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/RNABQKBCNR";
  const board = CapablancaBoard.fromString(boardStr);
  assertEquals(boardStr, board.toString());
});

Deno.test("Board validity #2", () => {
  const boardStr = "rnabqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/RNABQKBCNR";
  const board = CapablancaBoard.fromString(boardStr);
  assertEquals(board.get(7, 0), board.get(7, 9));
  assertEquals(board.get(7, 1), board.get(7, 8));
  assertEquals(board.get(7, 2), CapablancaPiece.Pieces.WHITE_ARCHBISHOP);
  assertEquals(board.get(7, 7), CapablancaPiece.Pieces.WHITE_CHANCELLOR);
});