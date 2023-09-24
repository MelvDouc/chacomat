import BaseGame from "@/base/BaseGame.ts";
import { IMove } from "@/typings/types.ts";
import CapablancaPosition from "@/variants/capablanca-chess/CapablancaPosition.ts";
import ChessGame from "@/variants/standard/ChessGame.ts";

export default class CapablancaChessGame extends BaseGame<CapablancaPosition> {
  protected static override get Position() {
    return CapablancaPosition;
  }

  public override getCurrentResult() {
    return ChessGame.prototype.getCurrentResult.call(this);
  }

  public override playMove(move: IMove, promotionType?: string) {
    return ChessGame.prototype.playMove.call(this, move, promotionType) as this;
  }

  public override playMoveWithNotation(notation: string) {
    return ChessGame.prototype.playMoveWithNotation.call(this, notation) as this;
  }
}