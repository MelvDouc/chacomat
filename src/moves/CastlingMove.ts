import Colors from "$src/constants/Colors.ts";
import SquareIndex from "$src/constants/SquareIndex.ts";
import globalConfig from "$src/global-config.ts";
import RealMove from "$src/moves/RealMove.ts";
import Pieces from "$src/pieces/Pieces.ts";
import { Board, Color, Piece, Wing } from "$src/typings/types.ts";

export default class CastlingMove extends RealMove {
  public readonly srcPiece: Piece;
  public readonly rook: Piece;
  public readonly kingSrcIndex: SquareIndex;
  public readonly kingDestIndex: SquareIndex;
  public readonly rookSrcIndex: SquareIndex;
  public readonly rookDestIndex: SquareIndex;
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

  public override get srcIndex(): SquareIndex {
    return this.kingSrcIndex;
  }

  public override get destIndex(): SquareIndex {
    return this.kingDestIndex;
  }

  public override get destPiece(): null {
    return null;
  }

  public override play(board: Board): void {
    board
      .remove(this.kingSrcIndex)
      .remove(this.rookSrcIndex)
      .set(this.kingDestIndex, this.srcPiece)
      .set(this.rookDestIndex, this.rook);
  }

  public override undo(board: Board): void {
    board
      .remove(this.kingDestIndex)
      .remove(this.rookDestIndex)
      .set(this.kingSrcIndex, this.srcPiece)
      .set(this.rookSrcIndex, this.rook);
  }

  public override isCapture(): boolean {
    return false;
  }

  public isQueenSide(): boolean {
    return this._xOffset === -1;
  }

  public isLegal(board: Board, enemyAttacks: Set<SquareIndex>): boolean {
    for (let i = 1; i <= 2; i++) {
      const kingIndex = this.kingSrcIndex + this._xOffset * i;
      if (board.has(kingIndex) || enemyAttacks.has(kingIndex))
        return false;
    }

    if (this.isQueenSide()) {
      const bFileSquareIndex = this.srcPiece.color === Colors.WHITE ? SquareIndex.b1 : SquareIndex.b8;
      return !board.has(bFileSquareIndex);
    }

    return true;
  }

  public override getAlgebraicNotation(): string {
    const char = globalConfig.useZerosForCastling ? "0" : "O";
    return char + `-${char}`.repeat(this.isQueenSide() ? 2 : 1);
  }
}