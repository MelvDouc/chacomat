import RealMove from "$src/moves/RealMove";
import Piece from "$src/pieces/Piece";
import { Board, Position, SquareIndex } from "$src/typings/types";

export default class PieceMove extends RealMove {
  readonly srcIndex: SquareIndex;
  readonly destIndex: SquareIndex;
  readonly srcPiece: Piece;
  readonly destPiece: Piece | null;

  constructor({ srcIndex, destIndex, srcPiece, destPiece }: {
    srcIndex: SquareIndex;
    destIndex: SquareIndex;
    srcPiece: Piece;
    destPiece: Piece | null;
  }) {
    super();
    this.srcIndex = srcIndex;
    this.destIndex = destIndex;
    this.srcPiece = srcPiece;
    this.destPiece = destPiece;
  }

  play(board: Board) {
    if (this.destPiece)
      board.remove(this.destIndex);
    board
      .remove(this.srcIndex)
      .set(this.destIndex, this.srcPiece);
  }

  undo(board: Board) {
    board
      .remove(this.destIndex)
      .set(this.srcIndex, this.srcPiece);
    if (this.destPiece)
      board.set(this.destIndex, this.destPiece);
  }

  isCapture() {
    return this.destPiece !== null;
  }

  getAlgebraicNotation(position: Position) {
    let notation = "";

    if (!this.srcPiece.isKing())
      notation += this._exactNotation(position);

    if (this.destPiece) notation += "x";
    return this.srcPiece.initial.toUpperCase() + notation + this.destNotation;
  }

  protected _exactNotation(position: Position) {
    const ambiguities = new Set<string>();

    for (const { srcIndex, destIndex, srcPoint, srcPiece } of position.legalMoves) {
      if (srcIndex === this.srcIndex || destIndex !== this.destIndex || srcPiece !== this.srcPiece)
        continue;

      if (srcPoint.x === this.srcPoint.x)
        ambiguities.add("x");
      else if (srcPoint.y === this.srcPoint.y)
        ambiguities.add("y");
      else
        ambiguities.add("");
    }

    if (ambiguities.size === 0)
      return "";

    if (!ambiguities.has("x"))
      return this.srcNotation[0];

    if (!ambiguities.has("y"))
      return this.srcNotation[1];

    return this.srcNotation;
  }
}