import type BaseBoard from "@/base/BaseBoard.ts";
import type BasePiece from "@/base/BasePiece.ts";
import type Coords from "@/base/Coords.ts";
import Move from "@/base/moves/Move.ts";

export default class PawnMove extends Move {
  public promotedPiece: BasePiece | null = null;

  public constructor(
    public readonly srcCoords: Coords,
    public readonly destCoords: Coords
  ) {
    super();
  }

  public try(board: BaseBoard) {
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

  public getAlgebraicNotation() {
    const promotion = !this.promotedPiece ? "" : `=${this.promotedPiece.initial.toUpperCase()}`;
    if (this.isCapture())
      return `${this.srcCoords.fileNotation}x${this.destCoords.notation + promotion}`;
    return this.destCoords.notation + promotion;
  }

  public getComputerNotation() {
    return super.getComputerNotation() + (this.promotedPiece?.initial.toUpperCase() ?? "");
  }

  public isCapture() {
    return this.srcCoords.y !== this.destCoords.y;
  }

  public isDouble() {
    return Math.abs(this.srcCoords.x - this.destCoords.x) === 2;
  }

  public isPromotion(board: BaseBoard) {
    return this.destCoords.x === board.get(this.srcCoords)?.color.opposite.getPieceRank(board.height);
  }
}