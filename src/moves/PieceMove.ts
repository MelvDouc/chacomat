import type Board from "$src/game/Board.js";
import type Position from "$src/game/Position.js";
import type Move from "$src/moves/Move.js";
import RegularMove from "$src/moves/RegularMove.js";

export default class PieceMove extends RegularMove {
  public play(board: Board) {
    board
      .remove(this.srcIndex)
      .set(this.destIndex, this.srcPiece);
  }

  public undo(board: Board) {
    this.capturedPiece
      ? board.set(this.destIndex, this.capturedPiece)
      : board.remove(this.destIndex);
    board.set(this.srcIndex, this.srcPiece);
  }

  public override getAlgebraicNotation(position: Position) {
    let notation = "";

    if (!this.srcPiece.isKing())
      notation += this._exactNotation(position.legalMoves);

    if (this.isCapture()) notation += "x";
    return this.srcPiece.initial.toUpperCase() + notation + this.destPoint.notation;
  }

  private _exactNotation(legalMoves: Move[]) {
    const ambiguities = new Set<"x" | "y" | "">();

    for (const move of legalMoves) {
      if (
        !(move instanceof PieceMove)
        || this.srcIndex === move.srcIndex
        || this.srcPiece !== move.srcPiece
        || move.destIndex !== this.destIndex
      )
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
      return this.srcPoint.fileNotation;

    if (!ambiguities.has("y"))
      return this.srcPoint.rankNotation;

    return this.srcPoint.notation;
  }
}