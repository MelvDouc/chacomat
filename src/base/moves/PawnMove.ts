import Move from "@/base/moves/Move.ts";
import { IBoard, ICoords, IPiece } from "@/typings/types.ts";

export default class PawnMove extends Move {
  public promotedPiece: IPiece | null = null;

  public constructor(
    public readonly srcCoords: ICoords,
    public readonly destCoords: ICoords
  ) {
    super();
  }

  public try(board: IBoard) {
    const srcPiece = board.get(this.srcCoords)!;
    const capturedPiece = board.get(this.destCoords);

    capturedPiece && board.delete(this.destCoords);
    board
      .set(this.destCoords, this.promotedPiece ?? srcPiece)
      .delete(this.srcCoords);

    return () => {
      board
        .set(this.srcCoords, srcPiece)
        .delete(this.destCoords);
      capturedPiece && board.set(this.destCoords, capturedPiece);
    };
  }

  public algebraicNotation() {
    const promotion = !this.promotedPiece ? "" : `=${this.promotedPiece.initial.toUpperCase()}`;
    if (this.isCapture())
      return `${this.srcCoords.fileNotation}x${this.destCoords.notation + promotion}`;
    return this.destCoords.notation + promotion;
  }

  public override computerNotation() {
    return super.computerNotation() + (this.promotedPiece?.initial.toUpperCase() ?? "");
  }

  public isCapture() {
    return this.srcCoords.y !== this.destCoords.y;
  }

  public isDouble() {
    return Math.abs(this.srcCoords.x - this.destCoords.x) === 2;
  }

  public isPromotion(board: IBoard) {
    return this.destCoords.x === board.get(this.srcCoords)?.color.opposite.getPieceRank(board.height);
  }
}