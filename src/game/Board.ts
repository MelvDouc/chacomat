import { indexTable } from "$src/constants/SquareIndex";
import { BOARD_WIDTH } from "$src/constants/dimensions";
import Pieces from "$src/pieces/Pieces";
import { Color, Piece, PieceInitial, SquareIndex } from "$src/typings/types";

export default class Board {
  static fromString(boardString: string) {
    return boardString
      .replace(/\d+/g, (count) => '0'.repeat(+count))
      .split("/")
      .reduceRight((acc, row, y) => {
        for (let x = 0; x < row.length; x++) {
          const char = row[x];
          if (char === "0") continue;

          const piece = Pieces.fromInitial(char);
          if (!piece) throw new Error(`Invalid board string character: "${char}".`);

          acc.set(indexTable[BOARD_WIDTH - y - 1][x], piece);
        }

        return acc;
      }, new this());
  }

  protected readonly _pieces = new Map<SquareIndex, Piece>();
  protected readonly _kingIndices = new Map<Color, SquareIndex>();

  get pieceCount() {
    return this._pieces.size;
  }

  get materialCount() {
    return [...this._pieces.values()].reduce((acc, { initial }) => {
      acc[initial] = (acc[initial] ?? 0) + 1;
      return acc;
    }, {} as Record<PieceInitial, number>);
  }

  has(index: SquareIndex) {
    return this._pieces.has(index);
  }

  equals(board: Board) {
    if (this.pieceCount !== board.pieceCount)
      return false;

    for (const [srcIndex, piece] of this._pieces)
      if (board.get(srcIndex) !== piece)
        return false;

    return true;
  }

  isKingEnPrise(color: Color) {
    const kingIndex = this.getKingIndex(color);

    for (const [srcIndex, piece] of this._pieces)
      if (piece.color !== color)
        for (const destIndex of piece.getAttacks(srcIndex, this))
          if (destIndex === kingIndex)
            return true;

    return false;
  }

  get(index: SquareIndex) {
    return this._pieces.get(index) ?? null;
  }

  getKingIndex(color: Color) {
    return this._kingIndices.get(color)!;
  }

  getColorAttacks(color: Color) {
    return [...this._pieces].reduce((acc, [srcIndex, piece]) => {
      if (piece.color === color)
        for (const attack of piece.getAttacks(srcIndex, this))
          acc.add(attack);

      return acc;
    }, new Set<SquareIndex>());
  }

  getPieces() {
    return [...this._pieces.entries()];
  }

  set(index: SquareIndex, piece: Piece) {
    this._pieces.set(index, piece);
    if (piece.isKing())
      this._kingIndices.set(piece.color, index);
    return this;
  }

  remove(index: SquareIndex) {
    this._pieces.delete(index);
    return this;
  }

  clone() {
    const clone = new Board();
    this._pieces.forEach((piece, srcIndex) => clone.set(srcIndex, piece));
    return clone;
  }

  /**
   * Get a board clone with pieces on opposite ranks or files or with colors reversed.
   */
  mirror({ vertically, horizontally, swapColors }: {
    vertically?: boolean;
    horizontally?: boolean;
    swapColors?: boolean;
  }) {
    const clone = new Board();

    for (let y = 0; y < BOARD_WIDTH; y++) {
      const y2 = vertically ? (BOARD_WIDTH - y - 1) : y;

      for (let x = 0; x < BOARD_WIDTH; x++) {
        const x2 = horizontally ? (BOARD_WIDTH - x - 1) : x;
        const index = indexTable[y2][x2];
        const piece = this.get(index);
        if (!piece) continue;
        clone.set(index, swapColors ? piece.opposite : piece);
      }
    }

    return clone;
  }

  toString() {
    return this.toArray()
      .map((_, y, arr) => arr[BOARD_WIDTH - y - 1].map((piece) => piece?.initial ?? "0").join(""))
      .join("/")
      .replace(/0+/g, (zeros) => String(zeros.length));
  }

  toArray() {
    return Array.from({ length: BOARD_WIDTH }, (_, y) => {
      return Array.from({ length: BOARD_WIDTH }, (_, x) => {
        const index = indexTable[y][x];
        return this.get(index)?.toJSON() ?? null;
      });
    });
  }

  /**
   * Output the board to the console in following format:
   * ```
   * 8 | r n b q k b n r
   * 7 | p p p p p p p p
   * 6 | . . . . . . . .
   * 5 | . . . . . . . .
   * 4 | . . . . . . . .
   * 3 | . . . . . . . .
   * 2 | P P P P P P P P
   * 1 | R N B Q K B N R
   *     _ _ _ _ _ _ _ _
   *     a b c d e f g h
   * ```
   */
  log() {
    console.log(
      this
        .toArray()
        .map((_, y, arr) => {
          return `${BOARD_WIDTH - y} | ${arr[BOARD_WIDTH - y - 1].map((piece) => piece?.initial ?? ".").join(" ")}`;
        })
        .join("\n")
      + "\n    _ _ _ _ _ _ _ _"
      + "\n    a b c d e f g h"
    );
  }
}