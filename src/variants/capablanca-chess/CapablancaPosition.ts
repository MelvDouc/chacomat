import CapablancaBoard from "@/variants/capablanca-chess/CapablancaBoard.ts";
import Position from "@/variants/standard/Position.ts";

export default class CapablancaPosition extends Position {
  public static override get START_FEN() {
    return "rnabqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/RNABQKBCNR w kqKQ - 0 1";
  }

  protected static override createBoard() {
    return new CapablancaBoard();
  }

  declare public readonly board: CapablancaBoard;
}