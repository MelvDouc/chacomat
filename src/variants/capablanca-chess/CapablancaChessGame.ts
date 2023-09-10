import ChessGame from "@/international/ChessGame.ts";
import CapablancaPosition from "@/variants/capablanca-chess/CapablancaPosition.ts";

export default class CapablancaChessGame extends ChessGame {
  protected static override readonly Position = CapablancaPosition;
}