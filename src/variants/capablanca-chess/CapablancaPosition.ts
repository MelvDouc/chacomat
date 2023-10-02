import Color from "@/base/Color.ts";
import CapablancaBoard from "@/variants/capablanca-chess/CapablancaBoard.ts";
import Position from "@/variants/standard/Position.ts";

export default class CapablancaPosition extends Position {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

  public static override get START_FEN() {
    return "rnabqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/RNABQKBCNR w kqKQ - 0 1";
  }

  // ===== ===== ===== ===== =====
  // STATIC PROTECTED
  // ===== ===== ===== ===== =====

  protected static override readonly promotionInitials = new Map([
    [Color.WHITE, ["Q", "R", "B", "N", "A", "C"]],
    [Color.BLACK, ["q", "r", "b", "n", "a", "c"]]
  ]);

  protected static override createBoard() {
    return new CapablancaBoard();
  }

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  declare public readonly board: CapablancaBoard;
}