import SquareIndex from "$src/constants/SquareIndex.js";
import type Board from "$src/game/Board.js";
import type Position from "$src/game/Position.js";
import RealMove from "$src/moves/RealMove.js";
import Piece from "$src/pieces/Piece.js";

export default class PieceMove extends RealMove {
  public readonly srcIndex: SquareIndex;
  public readonly destIndex: SquareIndex;
  public readonly srcPiece: Piece;
  public readonly destPiece: Piece | null;

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

  public play(board: Board) {
    board
      .remove(this.srcIndex)
      .set(this.destIndex, this.srcPiece);
  }

  public undo(board: Board) {
    this.destPiece
      ? board.set(this.destIndex, this.destPiece)
      : board.remove(this.destIndex);
    board.set(this.srcIndex, this.srcPiece);
  }

  public isCapture() {
    return this.destPiece !== null;
  }

  public override getAlgebraicNotation(position: Position) {
    let notation = "";

    if (!this.srcPiece.isKing())
      notation += this._exactNotation(position);

    if (this.isCapture()) notation += "x";
    return this.srcPiece.initial.toUpperCase() + notation + this.destNotation;
  }

  protected _isAmbiguousWith(move: RealMove) {
    return move.destIndex === this.destIndex
      && move.srcPiece === this.srcPiece;
  }

  protected _exactNotation(position: Position) {
    const ambiguities = new Set<"x" | "y" | "">();

    for (const move of position.legalMoves) {
      if (this.srcIndex === move.srcIndex || !this._isAmbiguousWith(move))
        continue;

      if (this.srcPoint.x === move.srcPoint.x)
        ambiguities.add("x");
      else if (this.srcPoint.y === move.srcPoint.y)
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