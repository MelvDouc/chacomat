import Move from "@/base/moves/Move.ts";
import { IBoard, IPiece } from "@/typings/types.ts";

export default class PieceMove extends Move {
  public constructor(
    public readonly srcIndex: number,
    public readonly destIndex: number
  ) {
    super();
  }

  public try(board: IBoard) {
    const srcPiece = board.get(this.srcIndex)!;
    const destPiece = board.get(this.destIndex);
    board
      .set(this.destIndex, srcPiece)
      .delete(this.srcIndex);

    return () => {
      destPiece
        ? board.set(this.destIndex, destPiece)
        : board.delete(this.destIndex);
      board.set(this.srcIndex, srcPiece);
    };
  }

  public algebraicNotation(board: IBoard, legalMoves: Move[]) {
    const srcPiece = board.get(this.srcIndex)!;
    let notation = "";

    if (!srcPiece.isKing())
      notation += this.exactNotation(board, legalMoves, srcPiece);

    if (board.has(this.destIndex)) notation += "x";
    return srcPiece.initial.toUpperCase() + notation + board.indexToNotation(this.destIndex);
  }

  protected exactNotation(board: IBoard, legalMoves: Move[], srcPiece: IPiece) {
    const ambiguousMoves = legalMoves.filter(({ srcIndex, destIndex }) => {
      return destIndex === this.destIndex
        && srcIndex !== this.srcIndex
        && board.get(srcIndex) === srcPiece;
    });

    if (!ambiguousMoves.length)
      return "";

    const { x, y } = board.indexToCoords(this.srcIndex);

    // alone on file
    if (ambiguousMoves.every(({ srcIndex }) => board.indexToFile(srcIndex) !== y))
      return board.indexToFileNotation(this.srcIndex);

    // not alone on file, alone on rank
    if (ambiguousMoves.every(({ srcIndex }) => board.indexToRank(srcIndex) !== x))
      return board.indexToRankNotation(this.srcIndex);

    // neither
    return board.indexToNotation(this.srcIndex);
  }
}