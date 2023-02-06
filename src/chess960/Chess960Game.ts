import Chess960Position from "@chacomat/chess960/Chess960Position.js";
import ChessGame from "@chacomat/game/ChessGame.js";
import { GameParameters } from "@chacomat/types.local.js";

export default class Chess960Game extends ChessGame {
  static override readonly Position = Chess960Position;

  constructor(parameters: GameParameters = {}) {
    if (!parameters.pgn && !parameters.fen && !parameters.positionParams)
      parameters.positionParams = Chess960Position.getStartPositionInfo();
    super(parameters);
  }
}