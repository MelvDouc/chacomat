import type Move from "@/base/moves/Move.ts";
import PawnMove from "@/base/moves/PawnMove.ts";
import Color from "@/constants/Color.ts";
import GameResults from "@/constants/GameResults.ts";
import Board from "@/standard/Board.ts";
import Piece from "@/standard/Piece.ts";
import Position from "@/standard/Position.ts";
import ShatranjGame from "@/variants/shatranj/ShatranjGame.ts";

export default class ChessGame extends ShatranjGame {
  protected static get Position() {
    return Position;
  }

  declare public ["constructor"]: typeof ChessGame;
  declare public currentPosition: Position;

  public updateResult() {
    if (this.currentPosition.isCheckmate()) {
      this.info.Result = (this.currentPosition.activeColor === Color.WHITE)
        ? GameResults.BLACK_WIN
        : GameResults.WHITE_WIN;
      return;
    }
    if (
      this.currentPosition.isStalemate()
      || this.currentPosition.isInsufficientMaterial()
      || this.currentPosition.isTripleRepetition()
    ) {
      this.info.Result = GameResults.DRAW;
      return;
    }
    this.info.Result = GameResults.NONE;
  }

  public playMove(move: Move, promotionType?: string) {
    const pos = this.currentPosition,
      board = pos.board.clone() as Board,
      castlingRights = pos.castlingRights.clone();
    const srcPiece = board.get(move.srcCoords)!,
      destPiece = board.get(move.destCoords);
    const isPawnMove = move instanceof PawnMove;

    if (isPawnMove && move.isPromotion(board)) {
      promotionType ??= "Q";
      move.promotedPiece = Piece.fromInitial(srcPiece.color === Color.WHITE ? promotionType : promotionType.toLowerCase())!;
    }

    if (srcPiece.isKing())
      castlingRights.get(pos.activeColor).clear();

    if (srcPiece.isRook() && move.srcCoords.x === pos.activeColor.getPieceRank(board.height))
      castlingRights.get(pos.activeColor).delete(move.srcCoords.y);

    if (destPiece?.isRook() && move.destCoords.x === pos.activeColor.opposite.getPieceRank(board.height))
      castlingRights.get(pos.activeColor.opposite).delete(move.destCoords.y);

    move.try(board);

    const nextPos = new this.constructor.Position({
      board,
      activeColor: pos.activeColor.opposite,
      castlingRights,
      enPassantCoords: isPawnMove && move.isDouble()
        ? board.Coords.get((move.srcCoords.x + move.destCoords.x) / 2, move.destCoords.y)
        : null,
      halfMoveClock: (destPiece || isPawnMove) ? 0 : (pos.halfMoveClock + 1),
      fullMoveNumber: pos.fullMoveNumber + Number(pos.activeColor === Color.BLACK)
    });
    nextPos.prev = pos;
    nextPos.srcMove = move;
    pos.next.push(nextPos);
    this.currentPosition = nextPos;
    return this;
  }

  public playMoveWithNotation(notation: string) {
    const move = this.currentPosition.legalMoves.find((move) => {
      return notation.startsWith(move.getComputerNotation());
    });

    if (!move)
      throw new Error(`Illegal move: "${notation}".`);

    return (move instanceof PawnMove)
      ? this.playMove(move, notation.at(-1))
      : this.playMove(move);
  }
}