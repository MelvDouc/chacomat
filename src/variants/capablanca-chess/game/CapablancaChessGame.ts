import ChessGame from "@/game/ChessGame.ts";
import type Move from "@/game/moves/Move.ts";
import { CapablancaChessPromotionType, PromotionType } from "@/types.ts";
import CapablancaPosition from "@/variants/capablanca-chess/game/CapablancaPosition.ts";

export default class CapablancaChessGame extends ChessGame {
  protected static override readonly Position = CapablancaPosition;

  public override playMove(move: Move, promotionType?: CapablancaChessPromotionType): CapablancaChessGame {
    return ChessGame.prototype.playMove.call(this, move, promotionType as PromotionType);
  }
}