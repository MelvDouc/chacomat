import type Color from "$src/game/Color.js";
import Point from "$src/game/Point.js";
import { BOARD_LENGTH, SquareIndex } from "$src/game/constants.js";
import Piece from "$src/pieces/Piece.js";
import Pieces from "$src/pieces/Pieces.js";
import type { JSONBoard, PieceInitial } from "$src/types.js";

export default class Board {
  public static fromString(boardString: string) {
    return boardString
      .replace(/\d+/g, (count) => "0".repeat(+count))
      .split("/")
      .reduceRight((acc, row, y) => {
        for (let x = 0; x < row.length; x++) {
          const char = row[x];
          if (char === "0") continue;

          const piece = Pieces.fromInitial(char);
          if (!piece) throw new Error(`Invalid board string character: "${char}".`);

          acc.set(Point.get(y, x).invertY().index, piece);
        }

        return acc;
      }, new this());
  }

  protected readonly _pieces: Map<SquareIndex, Piece> = new Map();
  protected readonly _kingIndices: Map<Color, SquareIndex> = new Map();

  public get pieceCount() {
    return this._pieces.size;
  }

  public get materialCount() {
    return [...this._pieces.values()].reduce((acc, { initial }) => {
      acc[initial] = (acc[initial] ?? 0) + 1;
      return acc;
    }, {} as Record<PieceInitial, number>);
  }

  public has(index: SquareIndex) {
    return this._pieces.has(index);
  }

  public equals(board: Board) {
    if (this.pieceCount !== board.pieceCount)
      return false;

    for (const [srcIndex, piece] of this._pieces)
      if (board.get(srcIndex) !== piece)
        return false;

    return true;
  }

  public isKingEnPrise(color: Color) {
    const kingIndex = this.getKingIndex(color);

    for (const [srcIndex, piece] of this._pieces)
      if (piece.color !== color && piece.getAttacks(srcIndex, this).includes(kingIndex))
        return true;

    return false;
  }

  public get(index: SquareIndex) {
    return this._pieces.get(index) ?? null;
  }

  public getKingIndex(color: Color) {
    return this._kingIndices.get(color)!;
  }

  public getColorAttacks(color: Color) {
    return [...this._pieces].reduce((acc, [srcIndex, piece]) => {
      if (piece.color === color)
        for (const attack of piece.getAttacks(srcIndex, this))
          acc.add(attack);

      return acc;
    }, new Set<SquareIndex>());
  }

  public getEntries(): [SquareIndex, Piece][] {
    return [...this._pieces.entries()];
  }

  public set(index: SquareIndex, piece: Piece) {
    this._pieces.set(index, piece);
    if (piece.isKing())
      this._kingIndices.set(piece.color, index);
    return this;
  }

  public remove(index: SquareIndex) {
    this._pieces.delete(index);
    return this;
  }

  public clone() {
    const clone = new Board();
    this._pieces.forEach((piece, srcIndex) => clone.set(srcIndex, piece));
    return clone;
  }

  /**
   * Get a board clone with pieces on opposite ranks or files or with colors reversed.
   */
  public mirror({ vertically, horizontally, swapColors }: {
    vertically?: boolean;
    horizontally?: boolean;
    swapColors?: boolean;
  }) {
    const clone = new Board();

    for (const [index, piece] of this._pieces) {
      const point = Point.fromIndex(index);
      const mirroredPoint = (vertically && horizontally) ? point.invert()
        : (vertically) ? point.invertY()
          : (horizontally) ? point.invertX()
            : point;
      clone.set(mirroredPoint.index, swapColors ? piece.opposite : piece);
    }

    return clone;
  }

  public toString() {
    return this.toArray()
      .map((_, y, arr) => arr[Point.invert(y)].map((piece) => piece?.initial ?? "0").join(""))
      .join("/")
      .replace(/0+/g, (zeros) => String(zeros.length));
  }

  public toArray(): JSONBoard {
    return Point.all().map((row) => {
      return row.map(({ index }) => {
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
          return `${BOARD_LENGTH - y} | ${arr[Point.invert(y)].map((piece) => piece?.initial ?? ".").join(" ")}`;
        })
        .join("\n")
      + "\n    _ _ _ _ _ _ _ _"
      + "\n    a b c d e f g h"
    );
  }
}