import ChessGame from "@src/game/ChessGame.js";
import Chess690Position from "@src/variants/chess960/Chess960Position.js";

export default class Chess960Game extends ChessGame {
  protected static override readonly Position = Chess690Position;
}