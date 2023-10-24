import Color from "@/board/Color.ts";
import { coords } from "@/board/Coords.ts";
import globalConfig from "@/global-config.ts";
import Move from "@/moves/Move.ts";
import { Pieces } from "@/pieces/Piece.ts";
import { ChacoMat } from "@/typings/chacomat.ts";

export default class CastlingMove extends Move {
  readonly direction: -1 | 1;
  readonly rook: ChacoMat.Piece;
  readonly rookSrcCoords: ChacoMat.Coords;
  readonly rookDestCoords: ChacoMat.Coords;

  constructor(
    srcCoords: ChacoMat.Coords,
    rookSrcX: number,
    color: ChacoMat.Color
  ) {
    super(
      srcCoords,
      coords[rookSrcX === 0 ? 2 : 6][srcCoords.y],
      color === Color.WHITE ? Pieces.WHITE_KING : Pieces.BLACK_KING
    );
    this.direction = this.destCoords.x < this.srcCoords.x ? -1 : 1;
    this.rook = color === Color.WHITE ? Pieces.WHITE_ROOK : Pieces.BLACK_ROOK;
    this.rookSrcCoords = coords[rookSrcX][this.srcCoords.y];
    this.rookDestCoords = this.destCoords.peer(-this.direction, 0)!;
  }

  isQueenSide() {
    return this.rookSrcCoords.x < this.srcCoords.x;
  }

  play(board: ChacoMat.Board) {
    board
      .delete(this.srcCoords)
      .set(this.destCoords, this.srcPiece)
      .delete(this.rookSrcCoords)
      .set(this.rookDestCoords, this.rook);
  }

  undo(board: ChacoMat.Board) {
    board
      .delete(this.destCoords)
      .delete(this.rookDestCoords)
      .set(this.srcCoords, this.srcPiece)
      .set(this.rookSrcCoords, this.rook);
  }

  algebraicNotation() {
    const char = globalConfig.useZerosForCastling ? "0" : "O";
    return char + `-${char}`.repeat(this.isQueenSide() ? 2 : 1);
  }

  isLegal(board: ChacoMat.Board, attackedCoords: Set<ChacoMat.Coords>) {
    for (const coords of this.srcCoords.peers(this.direction, 0)) {
      if (board.has(coords) || attackedCoords.has(coords))
        return false;
      if (coords === this.destCoords)
        break;
    }

    // Rook squares are also traversed by the king except for b1/b8.
    return !this.isQueenSide() || !board.has(this.rookSrcCoords.peer(1, 0)!);
  }
}