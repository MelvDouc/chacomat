import { Coordinates, Move } from "@/types/main-types.ts";
import PieceMove from "@/variants/shatranj/moves/PieceMove.ts";
import type ShatranjPiece from "@/variants/shatranj/ShatranjPiece.ts";
import type ShatranjBoard from "@/variants/shatranj/ShatranjBoard.ts";

export default class PawnMove implements Move {
  public promotedPiece: ShatranjPiece | null = null;

  public constructor(
    public readonly srcCoords: Coordinates,
    public readonly destCoords: Coordinates
  ) { }

  public try(board: ShatranjBoard) {
    const srcPiece = board.getByCoords(this.srcCoords)!;
    const capturedPieceCoords = this.getCapturedPieceCoords(board);
    const capturedPiece = board.getByCoords(capturedPieceCoords);

    capturedPiece && board.deleteCoords(capturedPieceCoords);
    board
      .setByCoords(this.destCoords, this.promotedPiece ?? srcPiece)
      .deleteCoords(this.srcCoords);

    return () => {
      board
        .setByCoords(this.srcCoords, srcPiece)
        .deleteCoords(this.destCoords);
      capturedPiece && board.setByCoords(capturedPieceCoords, capturedPiece);
    };
  }

  protected getCapturedPieceCoords(board: ShatranjBoard) {
    return this.destCoords.y !== this.srcCoords.y && !board.getByCoords(this.destCoords)
      ? board.Coords(this.srcCoords.x, this.destCoords.y)
      : this.destCoords;
  }

  public getCapturedPiece(board: ShatranjBoard) {
    return board.getByCoords(this.getCapturedPieceCoords(board));
  }

  public getComputerNotation() {
    return this.srcCoords.notation + this.destCoords.notation + (this.promotedPiece?.initial.toUpperCase() ?? "");
  }

  public getAlgebraicNotation() {
    const promotion = !this.promotedPiece ? "" : `=${this.promotedPiece.initial.toUpperCase()}`;
    if (this.destCoords.y !== this.srcCoords.y)
      return `${this.srcCoords.fileNotation}x${this.destCoords.notation + promotion}`;
    return this.destCoords.notation + promotion;
  }

  public isDouble() {
    return Math.abs(this.srcCoords.x - this.destCoords.x) === 2;
  }

  public isPromotion(board: ShatranjBoard) {
    return this.destCoords.x === board.getByCoords(this.srcCoords)?.color?.opposite?.getPieceRank(board.height);
  }

  public toJson(board: ShatranjBoard, legalMoves: Move[]) {
    return PieceMove.prototype.toJson.apply(this, [board, legalMoves]);
  }
}