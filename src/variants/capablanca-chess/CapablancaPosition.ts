import type Move from "@/base/moves/Move.ts";
import Position from "@/standard/Position.ts";
import CapablancaBoard from "@/variants/capablanca-chess/CapablancaBoard.ts";

export default class CapablancaPosition extends Position {
  protected static readonly Board: typeof CapablancaBoard = CapablancaBoard;

  public static get START_FEN() {
    return "rnabqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/RNABQKBCNR w kqKQ - 0 1";
  }

  declare public readonly board: CapablancaBoard;
  declare public prev?: CapablancaPosition;
  public readonly next: CapablancaPosition[] = [];
}