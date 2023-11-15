import Colors from "$src/constants/Colors.ts";
import SquareIndex from "$src/constants/SquareIndex.ts";
import globalConfig from "$src/global-config.ts";
import Move from "$src/moves/Move.ts";
import Pieces from "$src/pieces/Pieces.ts";
import { Board, Color, Piece, Wing } from "$src/typings/types.ts";

export default class CastlingMove extends Move {
  readonly srcPiece: Piece;
  readonly rook: Piece;
  readonly kingSrcIndex: SquareIndex;
  readonly kingDestIndex: SquareIndex;
  readonly rookSrcIndex: SquareIndex;
  readonly rookDestIndex: SquareIndex;
  protected readonly _xOffset: -1 | 1;

  constructor({ color, wing }: {
    color: Color;
    wing: Wing;
  }) {
    super();
    this._xOffset = (wing === "queenSide") ? -1 : 1;
    const isWhite = color === Colors.WHITE;
    this.srcPiece = isWhite ? Pieces.WHITE_KING : Pieces.BLACK_KING;
    this.rook = isWhite ? Pieces.WHITE_ROOK : Pieces.BLACK_ROOK;
    this.kingSrcIndex = isWhite ? SquareIndex.e1 : SquareIndex.e8;

    if (this.isQueenSide()) {
      this.kingDestIndex = isWhite ? SquareIndex.c1 : SquareIndex.c8;
      this.rookSrcIndex = isWhite ? SquareIndex.a1 : SquareIndex.a8;
      this.rookDestIndex = isWhite ? SquareIndex.d1 : SquareIndex.d8;
    } else {
      this.kingDestIndex = isWhite ? SquareIndex.g1 : SquareIndex.g8;
      this.rookSrcIndex = isWhite ? SquareIndex.h1 : SquareIndex.h8;
      this.rookDestIndex = isWhite ? SquareIndex.f1 : SquareIndex.f8;
    }
  }

  get srcIndex() {
    return this.kingSrcIndex;
  }

  get destIndex() {
    return this.kingDestIndex;
  }

  get destPiece() {
    return null;
  }

  play(board: Board) {
    board
      .remove(this.kingSrcIndex)
      .remove(this.rookSrcIndex)
      .set(this.kingDestIndex, this.srcPiece)
      .set(this.rookDestIndex, this.rook);
  }

  undo(board: Board) {
    board
      .remove(this.kingDestIndex)
      .remove(this.rookDestIndex)
      .set(this.kingSrcIndex, this.srcPiece)
      .set(this.rookSrcIndex, this.rook);
  }

  isCapture() {
    return false;
  }

  isQueenSide() {
    return this._xOffset === -1;
  }

  isLegal(board: Board, enemyAttacks: Set<SquareIndex>) {
    for (let i = this.kingSrcIndex + this._xOffset; ; i += this._xOffset) {
      if (board.has(i) || enemyAttacks.has(i))
        return false;
      if (i === this.kingDestIndex) break;
    }

    if (this.isQueenSide()) {
      const bFileSquareIndex = this.srcPiece.color === Colors.WHITE ? SquareIndex.b1 : SquareIndex.b8;
      return !board.has(bFileSquareIndex);
    }

    return true;
  }

  getAlgebraicNotation() {
    const char = globalConfig.useZerosForCastling ? "0" : "O";
    return char + `-${char}`.repeat(this.isQueenSide() ? 2 : 1);
  }
}