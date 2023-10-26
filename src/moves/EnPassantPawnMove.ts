import { coords } from "@/board/Coords.ts";
import Move from "@/moves/Move.ts";
import { ChacoMat } from "@/typings/chacomat.ts";

export default class EnPassantPawnMove extends Move {
  readonly capturedPieceCoords: ChacoMat.Coords;

  constructor(
    srcCoords: ChacoMat.Coords,
    destCoords: ChacoMat.Coords,
    srcPiece: ChacoMat.Piece
  ) {
    super(srcCoords, destCoords, srcPiece, srcPiece.opposite);
    this.capturedPieceCoords = coords[destCoords.x][srcCoords.y];
  }

  override algebraicNotation(): string {
    if (this.srcCoords.x !== this.destCoords.x)
      return `${this.srcCoords.fileName}x${this.destCoords.notation}`;
    return this.destCoords.notation;
  }

  override play(board: ChacoMat.Board) {
    board
      .set(this.destCoords, this.srcPiece)
      .delete(this.srcCoords)
      .delete(this.capturedPieceCoords);
  }

  override undo(board: ChacoMat.Board) {
    board
      .delete(this.destCoords)
      .set(this.srcCoords, this.srcPiece)
      .set(this.capturedPieceCoords, this.capturedPiece!);
  }
}