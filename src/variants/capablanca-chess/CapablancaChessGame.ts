import ChessGame from "@/standard/ChessGame.ts";
import CapablancaPosition from "@/variants/capablanca-chess/CapablancaPosition.ts";

export default class CapablancaChessGame extends ChessGame {
  protected static get Position() {
    return CapablancaPosition;
  }

  declare public ["constructor"]: typeof CapablancaChessGame;
  declare public currentPosition: CapablancaPosition;
}