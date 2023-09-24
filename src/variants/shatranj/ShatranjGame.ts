import BaseGame from "@/base/BaseGame.ts";
import Color from "@/base/Color.ts";
import GameResults from "@/base/GameResults.ts";
import PawnMove from "@/base/moves/PawnMove.ts";
import { IMove } from "@/typings/types.ts";
import ShatranjPosition from "@/variants/shatranj/ShatranjPosition.ts";

export default class ShatranjGame extends BaseGame<ShatranjPosition> {
  protected static override get Position() {
    return ShatranjPosition;
  }

  public override getCurrentResult() {
    if (this.currentPosition.isCheckmate()) {
      return this.currentPosition.activeColor === Color.WHITE
        ? GameResults.BLACK_WIN
        : GameResults.WHITE_WIN;
    }
    if (this.currentPosition.isStalemate()) {
      return GameResults.DRAW;
    }
    return GameResults.NONE;
  }

  public playMove(move: IMove) {
    const pos = this.currentPosition;
    const board = pos.board.clone();
    const srcPiece = board.get(move.srcCoords)!;

    if (move instanceof PawnMove && move.isPromotion(board))
      move.promotedPiece = board.pieceFromInitial(srcPiece.color === Color.WHITE ? "Q" : "q")!;

    move.try(board);

    const nextPos = new ShatranjPosition({
      board,
      activeColor: pos.activeColor.opposite,
      fullMoveNumber: pos.fullMoveNumber + Number(pos.activeColor === Color.BLACK)
    });
    nextPos.prev = pos;
    nextPos.srcMove = move;
    pos.next.push(nextPos);
    this.currentPosition = nextPos;
    return this;
  }

  // ===== ===== ===== ===== =====
  // PROTECTED
  // ===== ===== ===== ===== =====
}