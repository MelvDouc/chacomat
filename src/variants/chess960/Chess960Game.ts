import ChessGame from "@/standard/ChessGame.ts";
import Chess960Position from "@/variants/chess960/Chess960Position.ts";

export default class Chess960Game extends ChessGame {
  protected static readonly Position: typeof Chess960Position = Chess960Position;

  declare public ["constructor"]: typeof Chess960Game;
  declare public currentPosition: Chess960Position;

  public infoAsString() {
    const { Result, FEN, ...info } = this.info;
    const startFen = this.firstPosition.toString();
    const infoAsStrings = Object.entries(info)
      .map(([key, value]) => `[${key} "${value}"]`)
      .concat(`[Result "${this.info.Result}"]`)
      .concat(`[FEN "${startFen}"]`);

    return infoAsStrings.join("\n");
  }
}