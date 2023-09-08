import ChessGame from "@/impl/ChessGame.ts";
import CapablancaPosition from "@/variants/capablanca-chess/impl/CapablancaPosition.ts";

export default class CapablancaChessGame extends ChessGame {
  protected static override readonly Position = CapablancaPosition;
}