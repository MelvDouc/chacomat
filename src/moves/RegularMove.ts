import type Board from "$src/game/Board.js";
import Point from "$src/game/Point.js";
import Move from "$src/moves/Move.js";
import type Piece from "$src/pieces/Piece.js";

/**
 * A piece or pawn move.
 */
export default abstract class RegularMove extends Move {
  public readonly srcIndex: number;
  public readonly destIndex: number;
  public readonly srcPiece: Piece;
  public readonly capturedPiece: Piece | null;

  public constructor(
    srcIndex: number,
    destIndex: number,
    srcPiece: Piece,
    capturedPiece: Piece | null
  ) {
    super();
    this.srcIndex = srcIndex;
    this.destIndex = destIndex;
    this.srcPiece = srcPiece;
    this.capturedPiece = capturedPiece;
  }

  public get srcPoint() {
    return Point.fromIndex(this.srcIndex);
  }

  public get destPoint() {
    return Point.fromIndex(this.destIndex);
  }

  public isCapture() {
    return this.capturedPiece !== null;
  }

  public equals(move: RegularMove) {
    return this.srcIndex === move.srcIndex
      && this.destIndex === move.destIndex
      && this.srcPiece === move.srcPiece;
  }

  public abstract undo(board: Board): void;

  public getComputerNotation() {
    return this.srcPoint.notation + this.destPoint.notation;
  }
}