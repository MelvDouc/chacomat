import { coords } from "@/coordinates/Coords.ts";
import Move from "@/moves/Move.ts";
import Piece from "@/pieces/Piece.ts";
import type { ChacoMat } from "@/typings/chacomat.ts";

export default class PawnMove extends Move {
  readonly isEnPassant: boolean;
  readonly capturedPieceCoords: ChacoMat.Coords | null;
  promotedPiece: ChacoMat.Piece | null;

  constructor(
    srcCoords: ChacoMat.Coords,
    destCoords: ChacoMat.Coords,
    srcPiece: ChacoMat.Piece,
    capturedPiece: ChacoMat.Piece | null,
    isEnPassant: boolean,
    promotedPiece: ChacoMat.Piece | null = null
  ) {
    super(srcCoords, destCoords, srcPiece, capturedPiece);
    this.isEnPassant = isEnPassant;
    this.capturedPieceCoords = isEnPassant ? coords[destCoords.x][srcCoords.y] : destCoords;
    this.promotedPiece = promotedPiece;
  }

  play(board: ChacoMat.Board) {
    board
      .set(this.destCoords, this.promotedPiece ?? this.srcPiece)
      .delete(this.srcCoords);
    if (this.isEnPassant)
      board.delete(this.capturedPieceCoords!);
  }

  undo(board: ChacoMat.Board) {
    this.capturedPiece
      ? board.set(this.destCoords, this.capturedPiece)
      : board.delete(this.destCoords);
    board.set(this.srcCoords, this.srcPiece);
    if (this.isEnPassant)
      board.set(this.capturedPieceCoords!, this.capturedPiece!);
  }

  algebraicNotation() {
    let notation = this.destCoords.notation;
    if (this.srcCoords.x !== this.destCoords.x)
      notation = `${this.srcCoords.fileName}x${notation}`;
    if (this.promotedPiece)
      notation = `${notation}=${this.promotedPiece.whiteInitial}`;
    return notation;
  }

  override computerNotation() {
    return super.computerNotation() + (this.promotedPiece?.whiteInitial ?? "");
  }

  isDouble() {
    return Math.abs(this.destCoords.y - this.srcCoords.y) === 2;
  }

  isPromotion() {
    return this.destCoords.y === this.srcPiece.color.opposite.pieceRank;
  }

  *promotions() {
    const { srcCoords, destCoords, capturedPiece, srcPiece } = this;

    yield new PawnMove(srcCoords, destCoords, srcPiece, capturedPiece, false, Piece.fromWhiteInitialAndColor("Q", srcPiece.color));
    yield new PawnMove(srcCoords, destCoords, srcPiece, capturedPiece, false, Piece.fromWhiteInitialAndColor("R", srcPiece.color));
    yield new PawnMove(srcCoords, destCoords, srcPiece, capturedPiece, false, Piece.fromWhiteInitialAndColor("B", srcPiece.color));
    yield new PawnMove(srcCoords, destCoords, srcPiece, capturedPiece, false, Piece.fromWhiteInitialAndColor("N", srcPiece.color));
  }
}