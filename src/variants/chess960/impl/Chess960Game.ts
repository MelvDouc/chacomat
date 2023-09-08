import ChessGame from "@/impl/ChessGame.ts";
import Chess960Position from "@/variants/chess960/impl/Chess960Position.ts";

export default class Chess960Game extends ChessGame {
  protected static override readonly Position = Chess960Position;
}