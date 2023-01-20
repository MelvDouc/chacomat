import Chess960Position from "@chacomat/chess960/Chess960Position.js";
import ChessGame from "@chacomat/game/ChessGame.js";
import { ChessGameParameters } from "@chacomat/types.js";

export default class Chess960Game extends ChessGame {
  static override readonly Position = Chess960Position;

  constructor(chessGameParameters: ChessGameParameters = {}) {
    if (!chessGameParameters.fenString && !chessGameParameters.positionParams)
      chessGameParameters.positionParams = Chess960Position.getStartPositionInfo();
    super(chessGameParameters);
  }
}