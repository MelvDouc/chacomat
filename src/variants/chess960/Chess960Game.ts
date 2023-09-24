import BaseGame from "@/base/BaseGame.ts";
import { IMove } from "@/typings/types.ts";
import Chess960Position from "@/variants/chess960/Chess960Position.ts";
import ChessGame from "@/variants/standard/ChessGame.ts";

export default class Chess960Game extends BaseGame<Chess960Position> {
  protected static override get Position() {
    return Chess960Position;
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

  // ===== ===== ===== ===== =====
  // PROTECTED
  // ===== ===== ===== ===== =====

  protected override mustAddFENtoInfoString() {
    return true;
  }
}