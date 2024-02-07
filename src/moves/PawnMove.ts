import type Board from "$src/game/Board.js";
import RegularMove from "$src/moves/RegularMove.js";
import type Piece from "$src/pieces/Piece.js";
import Pieces from "$src/pieces/Pieces.js";
import Point from "$src/game/Point.js";

export default class PawnMove extends RegularMove {
  public readonly isEnPassant: boolean;
  public readonly promotedPiece: Piece | null;

  public constructor(
    srcIndex: number,
    destIndex: number,
    srcPiece: Piece,
    capturedPiece: Piece | null,
    isEnPassant: boolean,
    promotedPiece: Piece | null = null
  ) {
    super(srcIndex, destIndex, srcPiece, capturedPiece);
    this.isEnPassant = isEnPassant;
    this.promotedPiece = promotedPiece;
  }

  public get promotionInitial() {
    return this.promotedPiece?.initial.toUpperCase() ?? "";
  }

  public get capturedPieceIndex() {
    return this.isEnPassant
      ? Point.get(this.srcPoint.y, this.destPoint.x).index
      : this.destIndex;
  }

  public isDouble() {
    return Math.abs(this.destPoint.y - this.srcPoint.y) === 2;
  }

  public isPromotion() {
    return this.destPoint.y === this.srcPiece.color.opposite.initialPieceRank;
  }

  public override equals(move: RegularMove) {
    return super.equals(move) && this.promotedPiece === (move as PawnMove).promotedPiece;
  }

  public play(board: Board) {
    board
      .remove(this.srcIndex)
      .set(this.destIndex, this.promotedPiece ?? this.srcPiece);
    if (this.isEnPassant)
      board.remove(this.capturedPieceIndex);
  }

  public undo(board: Board) {
    board
      .remove(this.destIndex)
      .set(this.srcIndex, this.srcPiece);
    if (this.capturedPiece)
      board.set(this.capturedPieceIndex, this.capturedPiece);
  }

  public getAlgebraicNotation() {
    let notation = this.destPoint.notation;

    if (this.isCapture())
      notation = `${this.srcPoint.fileNotation}x${notation}`;

    if (this.promotedPiece)
      notation = `${notation}=${this.promotionInitial}`;

    return notation;
  }

  public override getComputerNotation() {
    return super.getComputerNotation() + this.promotionInitial;
  }

  public asPromotion(promotedPiece: Piece) {
    return new PawnMove(
      this.srcIndex,
      this.destIndex,
      this.srcPiece,
      this.capturedPiece,
      false,
      promotedPiece
    );
  }

  public *promotions() {
    const pieces = this.srcPiece.color.isWhite()
      ? Pieces.whitePieces()
      : Pieces.blackPieces();

    for (const piece of pieces) {
      if (!piece.isPawn() && !piece.isKing())
        yield this.asPromotion(piece);
    }
  }
}