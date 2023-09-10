import CapablancaBoard from "@/variants/capablanca-chess/CapablancaBoard.ts";
import CapablancaChessGame from "@/variants/capablanca-chess/CapablancaChessGame.ts";
import CapablancaPiece from "@/variants/capablanca-chess/CapablancaPiece.ts";
import { assertEquals } from "@dev_deps";

Deno.test("Board validity #1", () => {
  const boardStr = "rnabqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/RNABQKBCNR";
  const board = new CapablancaBoard().addPiecesFromString(boardStr);
  assertEquals(boardStr, board.toString());
});

Deno.test("Board validity #2", () => {
  const boardStr = "rnabqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/RNABQKBCNR";
  const board = new CapablancaBoard().addPiecesFromString(boardStr);
  assertEquals(board.get(70), board.get(79));
  assertEquals(board.get(71), board.get(78));
  assertEquals(board.get(72), CapablancaPiece.Pieces.WHITE_ARCHBISHOP);
  assertEquals(board.get(77), CapablancaPiece.Pieces.WHITE_CHANCELLOR);
});

Deno.test("castling", () => {
  const game = new CapablancaChessGame({
    pgn: `
    [FEN "rnabqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/R4K3R w kqKQ - 0 1"]

    1.0-0-0 *
  `});
  assertEquals(game.currentPosition.toString(), "rnabqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/2KR5R b kq - 1 1");
});