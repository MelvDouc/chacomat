import type Move from "@/base/moves/Move.ts";
import PawnMove from "@/base/moves/PawnMove.ts";
import Color from "@/constants/Color.ts";
import GameResults from "@/constants/GameResults.ts";
import Board from "@/standard/Board.ts";
import Piece from "@/standard/Piece.ts";
import Position from "@/standard/Position.ts";
import ShatranjGame from "@/variants/shatranj/ShatranjGame.ts";

export default class ChessGame extends ShatranjGame {
  protected static readonly Position: typeof Position = Position;

  declare public ["constructor"]: typeof ChessGame;
  declare public currentPosition: Position;

  public updateResult() {
    if (this.currentPosition.isCheckmate())
      this.info.Result = (this.currentPosition.activeColor === Color.WHITE)
        ? GameResults.BLACK_WIN
        : GameResults.WHITE_WIN;
    if (
      this.currentPosition.isStalemate()
      || this.currentPosition.isInsufficientMaterial()
      || this.currentPosition.isTripleRepetition()
    )
      this.info.Result = GameResults.DRAW;
    this.info.Result = GameResults.NONE;
  }

  public playMove(move: Move, promotionType?: string) {
    const pos = this.currentPosition,
      board = pos.board.clone() as Board,
      castlingRights = pos.castlingRights.clone();
    const srcPiece = board.get(move.srcIndex)!,
      destPiece = board.get(move.destIndex);
    const isPawnMove = move instanceof PawnMove;

    if (isPawnMove && move.isPromotion(board)) {
      promotionType ??= "Q";
      move.promotedPiece = Piece.fromInitial(srcPiece.color === Color.WHITE ? promotionType : promotionType.toLowerCase())!;
    }

    if (srcPiece.isKing())
      castlingRights.get(pos.activeColor)!.clear();

    if (srcPiece.isRook() && move.getSrcCoords(board).x === pos.activeColor.getPieceRank(board.height))
      castlingRights.get(pos.activeColor)!.delete(move.srcIndex);

    if (destPiece?.isRook() && move.getDestCoords(board).x === pos.activeColor.opposite.getPieceRank(board.height))
      castlingRights.get(pos.activeColor.opposite)!.delete(move.destIndex);

    move.try(board);

    const nextPos = new this.constructor.Position({
      board,
      activeColor: pos.activeColor.opposite,
      castlingRights,
      enPassantIndex: isPawnMove && move.isDouble(board.height) ? ((move.srcIndex + move.destIndex) / 2) : -1,
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
    const srcIndex = this.currentPosition.board.notationToIndex(notation.slice(0, 2));
    const destIndex = this.currentPosition.board.notationToIndex(notation.slice(2, 4));
    const move = this.currentPosition.legalMoves.find((move) => {
      return move.srcIndex === srcIndex && move.destIndex === destIndex;
    });

    if (!move)
      throw new Error(`Illegal move: "${notation}".`);

    return (move instanceof PawnMove)
      ? this.playMove(move, notation.at(-1))
      : this.playMove(move);
  }
}