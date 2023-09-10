import ChessGame from "@/international/ChessGame.ts";
import Chess960Position from "@/variants/chess960/Chess960Position.ts";

export default class Chess960Game extends ChessGame {
  protected static override readonly Position = Chess960Position;
}