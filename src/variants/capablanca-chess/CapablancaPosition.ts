import Position from "@/game/Position.ts";
import CapablancaBoard from "@/variants/capablanca-chess/CapablancaBoard.ts";
import CapablancaCastlingRights from "@/variants/capablanca-chess/CapablancaCastlingRights.ts";

export default class CapablancaPosition extends Position {
  protected static override readonly Board = CapablancaBoard;
  protected static override readonly CastlingRights = CapablancaCastlingRights;

  public static override isValidFen(fen: string) {
    return /^[pnbrqkacPNBRQKAC0-9]+(\/[pnbrqkacPNBRQKAC0-9]+){7} (w|b) ([KQkq]{1,4}|-) ([a-j][36]|-) \d+ \d+$/.test(fen);
  }

  public static override new() {
    return this.fromFen("rnabqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/RNABQKBCNR w KQkq - 0 1");
  }
}