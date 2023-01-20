import Chess960Position from "@chacomat/chess960/Chess960Position.js";
import ChessGame from "@chacomat/game/ChessGame.js";
import { ChessGameFenParameter, ChessGamePositionParameter } from "@chacomat/types.js";

export default class Chess960Game extends ChessGame {
  static override readonly Position = Chess960Position;

  constructor(param = {}) {
    if (!(<ChessGameFenParameter>param).fenString && !(<ChessGamePositionParameter>param).positionParams)
      (<ChessGamePositionParameter>param).positionParams = Chess960Position.getStartPositionInfo();
    super(param);
  }
}