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
  const a1 = board.at(7, 0);
  const b1 = board.at(7, 1);
  const c1 = board.at(7, 2);
  const h1 = board.at(7, 7);
  const i1 = board.at(7, 8);
  const j1 = board.at(7, 9);
  assertEquals(a1, j1);
  assertEquals(b1, i1);
  assertEquals(c1, CapablancaPiece.Pieces.WHITE_ARCHBISHOP);
  assertEquals(h1, CapablancaPiece.Pieces.WHITE_CHANCELLOR);
});

Deno.test("castling", () => {
  const game = new CapablancaChessGame({
    pgn: `
    [FEN "rnabqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/R4K3R w kqKQ - 0 1"]

    1.0-0-0 *
  `});
  assertEquals(game.currentPosition.toString(), "rnabqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/2KR5R b kq - 1 1");
});