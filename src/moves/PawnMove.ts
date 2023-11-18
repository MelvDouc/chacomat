import Colors from "$src/constants/Colors";
import { pieceRanks } from "$src/constants/Ranks";
import { indexTable } from "$src/constants/SquareIndex";
import Move from "$src/moves/Move";
import Piece from "$src/pieces/Piece";
import Pieces from "$src/pieces/Pieces";
import { Board, SquareIndex } from "$src/typings/types";

export default class PawnMove extends Move {
  readonly srcIndex: SquareIndex;
  readonly destIndex: SquareIndex;
  readonly srcPiece: Piece;
  readonly destPiece: Piece | null;
  private readonly _isEnPassant: boolean;
  private _promotedPiece: Piece | null = null;

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

  get promotionInitial() {
    return this._promotedPiece?.initial.toUpperCase() ?? "";
  }

  get capturedPieceIndex() {
    if (this._isEnPassant)
      return indexTable[this.srcPoint.y][this.destPoint.x];
    return this.destIndex;
  }

  getPromotedPiece() {
    return this._promotedPiece;
  }

  setPromotedPiece(piece: Piece) {
    this._promotedPiece = piece;
    return this;
  }

  getAlgebraicNotation() {
    let notation = this.destNotation;

    if (this.srcPoint.x !== this.destPoint.x)
      notation = `${this.srcNotation[0]}x${notation}`;

    if (this._promotedPiece)
      notation = `${notation}=${this.promotionInitial}`;

    return notation;
  }

  play(board: Board) {
    board
      .remove(this.capturedPieceIndex)
      .remove(this.srcIndex)
      .set(this.destIndex, this._promotedPiece ?? this.srcPiece);
  }

  undo(board: Board) {
    board
      .remove(this.destIndex)
      .set(this.srcIndex, this.srcPiece);
    if (this.destPiece)
      board.set(this.capturedPieceIndex, this.destPiece);
  }

  getComputerNotation() {
    return super.getComputerNotation() + this.promotionInitial;
  }

  isCapture() {
    return this.destPoint.x !== this.srcPoint.x;
  }

  isDouble() {
    return Math.abs(this.destPoint.y - this.srcPoint.y) === 2;
  }

  isEnPassant() {
    return this._isEnPassant;
  }

  isPromotion() {
    return this.destPoint.y === pieceRanks[this.srcPiece.opposite.color];
  }

  *promotions() {
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