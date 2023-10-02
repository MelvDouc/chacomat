import BaseGame from "@/base/BaseGame.ts";
import { IMove } from "@/typings/types.ts";
import CapablancaPosition from "@/variants/capablanca-chess/CapablancaPosition.ts";
import ChessGame from "@/variants/standard/ChessGame.ts";

export default class CapablancaChessGame extends BaseGame<CapablancaPosition> {
  // ===== ===== ===== ===== =====
  // STATIC PROTECTED
  // ===== ===== ===== ===== =====

  protected static override get Position() {
    return CapablancaPosition;
  }

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  public override getCurrentResult() {
    return ChessGame.prototype.getCurrentResult.call(this);
  }

  public override playMove(move: IMove) {
    return ChessGame.prototype.playMove.call(this, move) as this;
  }
}