import CapablancaBoard from "@/variants/capablanca-chess/CapablancaBoard.ts";
import Position from "@/variants/standard/Position.ts";

export default class CapablancaPosition extends Position {
  protected static override get Board() {
    return CapablancaBoard;
  }

  public static override get START_FEN() {
    return "rnabqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/RNABQKBCNR w kqKQ - 0 1";
  }

  declare public readonly board: CapablancaBoard;
}