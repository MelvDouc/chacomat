import Board from "$src/game/Board.js";
import Color from "$src/game/Color.js";
import Point from "$src/game/Point.js";
import { SquareIndex, BOARD_LENGTH } from "$src/game/constants.js";
import globalConfig from "$src/global-config.js";
import RealMove from "$src/moves/RealMove.js";
import type Piece from "$src/pieces/Piece.js";
import Pieces from "$src/pieces/Pieces.js";
import type { Wing } from "$src/types.js";

export default class CastlingMove extends RealMove {
  public readonly srcPiece: Piece;
  public readonly rook: Piece;
  public readonly kingSrcIndex: SquareIndex;
  public readonly kingDestIndex: SquareIndex;
  public readonly rookSrcIndex: SquareIndex;
  public readonly rookDestIndex: SquareIndex;
  protected readonly _xOffset: -1 | 1;

  public constructor({ color, wing }: {
    color: Color;
    wing: Wing;
  }) {
    super();
    this._xOffset = (wing === "queenSide") ? -1 : 1;
    this.srcPiece = color.isWhite() ? Pieces.WHITE_KING : Pieces.BLACK_KING;
    this.rook = color.isWhite() ? Pieces.WHITE_ROOK : Pieces.BLACK_ROOK;

    const rank = this.srcPiece.color.initialPieceRank;
    this.kingSrcIndex = Point.get(rank, 4).index;
    this.kingDestIndex = this.kingSrcIndex + this._xOffset * 2;
    this.rookSrcIndex = Point.get(rank, this.isQueenSide() ? 0 : (BOARD_LENGTH - 1)).index;
    this.rookDestIndex = this.kingDestIndex - this._xOffset;
  }

  public override get srcIndex() {
    return this.kingSrcIndex;
  }

  public override get destIndex() {
    return this.kingDestIndex;
  }

  public override get destPiece() {
    return null;
  }

  public override play(board: Board) {
    board
      .remove(this.kingSrcIndex)
      .remove(this.rookSrcIndex)
      .set(this.kingDestIndex, this.srcPiece)
      .set(this.rookDestIndex, this.rook);
  }

  public override undo(board: Board) {
    board
      .remove(this.kingDestIndex)
      .remove(this.rookDestIndex)
      .set(this.kingSrcIndex, this.srcPiece)
      .set(this.rookSrcIndex, this.rook);
  }

  public override isCapture() {
    return false;
  }

  public isQueenSide() {
    return this._xOffset === -1;
  }

  public isLegal(board: Board, enemyAttacks: Set<SquareIndex>) {
    for (let i = 1; i <= 2; i++) {
      const kingIndex = this.kingSrcIndex + this._xOffset * i;
      if (board.has(kingIndex) || enemyAttacks.has(kingIndex))
        return false;
    }

    if (this.isQueenSide()) {
      const bFilePoint = Point.get(this.rook.color.initialPieceRank, 1);
      return !board.has(bFilePoint.index);
    }

    return true;
  }

  public override getAlgebraicNotation() {
    const char = globalConfig.castlingCharacter;
    return char + `-${char}`.repeat(this.isQueenSide() ? 2 : 1);
  }
}