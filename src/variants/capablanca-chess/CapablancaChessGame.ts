import ChessGame from "@/standard/ChessGame.ts";
import CapablancaPosition from "@/variants/capablanca-chess/CapablancaPosition.ts";

export default class CapablancaChessGame extends ChessGame {
  protected static readonly Position: typeof CapablancaPosition = CapablancaPosition;

  declare public ["constructor"]: typeof CapablancaChessGame;
  declare public currentPosition: CapablancaPosition;
}