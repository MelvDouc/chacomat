import Board from "$src/game/Board.js";
import type Color from "$src/game/Color.js";
import Point from "$src/game/Point.js";
import { BOARD_LENGTH } from "$src/game/constants.js";
import globalConfig from "$src/global-config.js";
import Move from "$src/moves/Move.js";
import type Piece from "$src/pieces/Piece.js";
import Pieces from "$src/pieces/Pieces.js";
import type { Wing } from "$src/types.js";

export default class CastlingMove extends Move {
  public readonly king: Piece;
  public readonly rook: Piece;
  public readonly kingSrcIndex: number;
  public readonly kingDestIndex: number;
  public readonly rookSrcIndex: number;
  public readonly rookDestIndex: number;
  private readonly _xOffset: -1 | 1;

  public constructor(color: Color, wing: Wing) {
    super();
    this._xOffset = (wing === "queenSide") ? -1 : 1;
    this.king = color.isWhite() ? Pieces.WHITE_KING : Pieces.BLACK_KING;
    this.rook = color.isWhite() ? Pieces.WHITE_ROOK : Pieces.BLACK_ROOK;

    const rank = this.king.color.initialPieceRank;
    this.kingSrcIndex = Point.get(rank, 4).index;
    this.kingDestIndex = this.kingSrcIndex + this._xOffset * 2;
    this.rookSrcIndex = Point.get(rank, this.isQueenSide() ? 0 : BOARD_LENGTH - 1).index;
    this.rookDestIndex = this.kingDestIndex - this._xOffset;
  }

  public isQueenSide() {
    return this._xOffset === -1;
  }

  public isLegal(board: Board, enemyAttacks: Set<number>) {
    let destIndex = this.kingSrcIndex;

    do {
      destIndex += this._xOffset;
      if (board.has(destIndex) || enemyAttacks.has(destIndex))
        return false;
    } while (destIndex !== this.kingDestIndex);

    if (this.isQueenSide()) {
      const bFilePoint = Point.get(this.rook.color.initialPieceRank, 1);
      return !board.has(bFilePoint.index);
    }

    return true;
  }

  public play(board: Board) {
    board
      .remove(this.kingSrcIndex)
      .remove(this.rookSrcIndex)
      .set(this.kingDestIndex, this.king)
      .set(this.rookDestIndex, this.rook);
  }

  public getComputerNotation() {
    return Point.fromIndex(this.kingSrcIndex).notation + Point.fromIndex(this.kingDestIndex).notation;
  }

  public getAlgebraicNotation() {
    const o = globalConfig.castlingCharacter;
    return this.isQueenSide()
      ? `${o}-${o}-${o}`
      : `${o}-${o}`;
  }
}