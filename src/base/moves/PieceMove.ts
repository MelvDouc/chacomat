import BaseBoard from "@/base/BaseBoard.ts";
import Move from "@/base/moves/Move.ts";

export default class PieceMove extends Move {
  public constructor(
    public readonly srcIndex: number,
    public readonly destIndex: number
  ) {
    super();
  }

  public try(board: BaseBoard) {
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

  public getAlgebraicNotation(board: BaseBoard, legalMoves: Move[]) {
    const srcPiece = board.get(this.srcIndex);
    let notation = "";

    if (!srcPiece.isKing()) {
      const ambiguousMoves = legalMoves.filter(({ srcIndex, destIndex }) => {
        return destIndex === this.destIndex && srcIndex !== this.srcIndex && board.get(srcIndex) === srcPiece;
      });
      if (ambiguousMoves.length) {
        const { x, y } = this.getSrcCoords(board);
        const aloneOnFile = !ambiguousMoves.some(({ srcIndex }) => board.indexToCoords(srcIndex).y === y);
        const aloneOnRank = !ambiguousMoves.some(({ srcIndex }) => board.indexToCoords(srcIndex).x === x);
        if (!aloneOnFile)
          notation += board.getRankNotation(this.srcIndex);
        if (!aloneOnRank || aloneOnFile)
          notation = board.getFileNotation(this.srcIndex) + notation;
      }
    }

    if (board.has(this.destIndex)) notation += "x";
    return srcPiece.initial.toUpperCase() + notation + board.getNotation(this.destIndex);
  }
}