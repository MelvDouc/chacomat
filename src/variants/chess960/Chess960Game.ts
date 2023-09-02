import ChessGame from "@game/ChessGame.js";
import Chess960Position from "@variants/chess960/Chess960Position.js";

export default class Chess960Game extends ChessGame {
  protected static override Position = Chess960Position;

  protected static override createFirstPosition(fen?: string) {
    return fen ? Chess960Position.fromFen(fen) : Chess960Position.random();
  }
}