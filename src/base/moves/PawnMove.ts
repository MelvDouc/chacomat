import Move from "@/base/moves/Move.ts";
import { IBoard, IPiece } from "@/typings/types.ts";

export default class PawnMove extends Move {
  public constructor(
    public readonly srcIndex: number,
    public readonly destIndex: number,
    public promotedPiece: IPiece | null = null
  ) {
    super();
  }

  public try(board: IBoard) {
    const srcPiece = board.get(this.srcIndex)!;
    const capturedPiece = board.get(this.destIndex);

    board
      .set(this.destIndex, this.promotedPiece ?? srcPiece)
      .delete(this.srcIndex);

    return () => {
      board
        .set(this.srcIndex, srcPiece)
        .delete(this.destIndex);
      capturedPiece && board.set(this.destIndex, capturedPiece);
    };
  }

  public algebraicNotation(board: IBoard) {
    const destNotation = board.indexToNotation(this.destIndex) + (this.promotedPiece ? `=${this.promotedPiece.initial.toUpperCase()}` : "");
    if (this.isCapture(board))
      return `${board.indexToFileNotation(this.srcIndex)}x${destNotation}`;
    return destNotation;
  }

  public override computerNotation(board: IBoard) {
    return super.computerNotation(board) + (this.promotedPiece?.initial.toUpperCase() ?? "");
  }

  public isCapture(board: IBoard) {
    return board.indexToFile(this.srcIndex) !== board.indexToFile(this.destIndex);
  }

  public isDouble(board: IBoard) {
    return Math.abs(this.srcIndex - this.destIndex) === board.height * 2;
  }

  public isPromotion(board: IBoard) {
    return board.indexToRank(this.destIndex) === board.pieceRank(board.get(this.srcIndex)!.color.opposite);
  }
}