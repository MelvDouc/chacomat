import BaseGame from "@/base/BaseGame.ts";
import Color from "@/base/Color.ts";
import GameResults from "@/base/GameResults.ts";
import PawnMove from "@/base/moves/PawnMove.ts";
import { IMove } from "@/typings/types.ts";
import Position from "@/variants/standard/Position.ts";

export default class ChessGame extends BaseGame<Position> {
  // ===== ===== ===== ===== =====
  // STATIC PROTECTED
  // ===== ===== ===== ===== =====

  protected static override get Position() {
    return Position;
  }

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  public override getCurrentResult() {
    if (this.currentPosition.isCheckmate()) {
      return (this.currentPosition.activeColor === Color.WHITE)
        ? GameResults.BLACK_WIN
        : GameResults.WHITE_WIN;
    }
    if (
      this.currentPosition.isStalemate()
      || this.currentPosition.isInsufficientMaterial()
      || this.currentPosition.isTripleRepetition()
    ) {
      return GameResults.DRAW;
    }
    return GameResults.NONE;
  }

  public override playMove(move: IMove) {
    const pos = this.currentPosition,
      board = pos.board.clone(),
      castlingRights = pos.castlingRights.clone(),
      srcPiece = board.get(move.srcIndex)!,
      destPiece = board.get(move.destIndex),
      isPawnMove = move instanceof PawnMove;

    if (srcPiece.isKing())
      castlingRights.get(pos.activeColor).clear();

    else if (srcPiece.isRook() && board.indexToRank(move.srcIndex) === board.pieceRank(pos.activeColor))
      castlingRights.get(pos.activeColor).delete(board.indexToFile(move.srcIndex));

    if (destPiece?.isRook() && board.indexToRank(move.destIndex) === board.pieceRank(pos.activeColor.opposite))
      castlingRights.get(pos.activeColor.opposite).delete(board.indexToFile(move.destIndex));

    move.try(board);

    const nextPos = new (pos.constructor as typeof Position)({
      board,
      activeColor: pos.activeColor.opposite,
      castlingRights,
      enPassantIndex: isPawnMove && move.isDouble(board)
        ? move.srcIndex + board.height * pos.activeColor.direction
        : -1,
      halfMoveClock: (destPiece || isPawnMove) ? 0 : (pos.halfMoveClock + 1),
      fullMoveNumber: pos.fullMoveNumber + Number(pos.activeColor === Color.BLACK)
    });
    nextPos.prev = pos;
    nextPos.srcMove = move;
    pos.next.push(nextPos);
    this.currentPosition = nextPos;
    return this;
  }
}