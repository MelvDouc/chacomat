import ChessGame from "@chacomat/game/ChessGame.js";
import Chess960Position from "@chacomat/chess960/Chess960Position.js";
import { getChess960FenString } from "@chacomat/utils/fischer-random.js";

export default class Chess960Game extends ChessGame {
  protected static override readonly Position = Chess960Position;

  public static getRandomGame(): Chess960Game {
    return new Chess960Game({
      fenString: getChess960FenString()
    });
  }

  public override currentPosition: Chess960Position;
}