import Colors from "$src/constants/Colors.ts";
import { pieceRanks } from "$src/constants/Ranks.ts";
import { indexTable } from "$src/constants/SquareIndex.ts";
import RealMove from "$src/moves/RealMove.ts";
import Piece from "$src/pieces/Piece.ts";
import Pieces from "$src/pieces/Pieces.ts";
import { Board, SquareIndex } from "$src/typings/types.ts";
import AbstractMove from "$src/moves/AbstractMove.ts";

export default class PawnMove extends RealMove {
  public readonly srcIndex: SquareIndex;
  public readonly destIndex: SquareIndex;
  public readonly srcPiece: Piece;
  public readonly destPiece: Piece | null;
  protected readonly _isEnPassant: boolean;
  protected _promotedPiece: Piece | null = null;

  constructor({ srcIndex, destIndex, isEnPassant, srcPiece, destPiece }: {
    srcIndex: SquareIndex;
    destIndex: SquareIndex;
    isEnPassant: boolean;
    srcPiece: Piece;
    destPiece: Piece | null;
  }) {
    super();
    this.srcPiece = srcPiece;
    this.srcIndex = srcIndex;
    this.destIndex = destIndex;
    this.destPiece = destPiece;
    this._isEnPassant = isEnPassant;
  }

  public get promotionInitial() {
    return this._promotedPiece?.initial.toUpperCase() ?? "";
  }

  public get capturedPieceIndex() {
    if (this._isEnPassant)
      return indexTable[this.srcPoint.y][this.destPoint.x];
    return this.destIndex;
  }

  public getPromotedPiece() {
    return this._promotedPiece;
  }

  public setPromotedPiece(piece: Piece) {
    this._promotedPiece = piece;
    return this;
  }

  public override getAlgebraicNotation() {
    let notation = this.destNotation;

    if (this.srcPoint.x !== this.destPoint.x)
      notation = `${this.srcNotation[0]}x${notation}`;

    if (this._promotedPiece)
      notation = `${notation}=${this.promotionInitial}`;

    return notation;
  }

  public play(board: Board) {
    board
      .remove(this.capturedPieceIndex)
      .remove(this.srcIndex)
      .set(this.destIndex, this._promotedPiece ?? this.srcPiece);
  }

  public undo(board: Board) {
    board
      .remove(this.destIndex)
      .set(this.srcIndex, this.srcPiece);
    if (this.destPiece)
      board.set(this.capturedPieceIndex, this.destPiece);
  }

  public override getComputerNotation() {
    return super.getComputerNotation() + this.promotionInitial;
  }

  public override equals(move: AbstractMove) {
    return super.equals(move)
      && (move as PawnMove)._promotedPiece === this._promotedPiece;
  }

  public isCapture() {
    return this.destPoint.x !== this.srcPoint.x;
  }

  public isDouble() {
    return Math.abs(this.destPoint.y - this.srcPoint.y) === 2;
  }

  public isEnPassant() {
    return this._isEnPassant;
  }

  public isPromotion() {
    return this.destPoint.y === pieceRanks[this.srcPiece.opposite.color];
  }

  public *promotions() {
    const params = {
      srcIndex: this.srcIndex,
      destIndex: this.destIndex,
      isEnPassant: false,
      srcPiece: this.srcPiece,
      destPiece: this.destPiece
    };
    const gen = this.srcPiece.color === Colors.WHITE
      ? Pieces.whitePieces()
      : Pieces.blackPieces();

    for (const piece of gen)
      if (!piece.isPawn() && !piece.isKing())
        yield (new PawnMove(params)).setPromotedPiece(piece);
  }
}