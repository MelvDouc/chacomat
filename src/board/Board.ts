import Coords, { coords } from "@/coordinates/Coords.ts";
import Piece from "@/pieces/Piece.ts";
import { ChacoMat } from "@/typings/chacomat.ts";

export default class Board {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

  /**
   * Create a board from the board portion of an FEN string.
   */
  static fromString(boardStr: string) {
    const board = new this();

    for (const [y, row] of boardStr.split("/").entries()) {
      let x = 0;

      for (const char of row) {
        if (!isNaN(+char)) {
          x += +char;
          continue;
        }

        const piece = Piece.fromInitial(char);
        if (!piece) throw new Error(`Invalid piece initial: "${char}".`);

        board.set(coords[x][y], piece);
        x++;
      }
    }

    return board;
  }

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  readonly #pieces = new Map<ChacoMat.Coords, ChacoMat.Piece>();
  readonly #kingCoords = new Map<ChacoMat.Color, ChacoMat.Coords>();

  /**
   * The map that contains the pieces.
   * It uses unique coordinates for keys.
   */
  get pieces() {
    return this.#pieces;
  }

  has(coords: ChacoMat.Coords) {
    return this.#pieces.has(coords);
  }

  get(coords: ChacoMat.Coords) {
    return this.#pieces.get(coords) ?? null;
  }

  set(coords: ChacoMat.Coords, piece: Piece) {
    this.#pieces.set(coords, piece);
    if (piece.isKing()) this.#kingCoords.set(piece.color, coords);
    return this;
  }

  delete(coords: ChacoMat.Coords) {
    this.#pieces.delete(coords);
    return this;
  }

  getKingCoords(color: ChacoMat.Color) {
    return this.#kingCoords.get(color)!;
  }

  /**
   * Get a set of all the coordinates attacked by the pieces of the given color.
   */
  getAttackedCoordsSet(color: ChacoMat.Color) {
    const set = new Set<ChacoMat.Coords>();

    for (const [srcCoords, piece] of this.#pieces)
      if (piece.color === color)
        for (const destCoords of piece.getAttackedCoords(this, srcCoords))
          set.add(destCoords);

    return set;
  }

  isColorInCheck(color: ChacoMat.Color) {
    const kingCoords = this.getKingCoords(color);

    for (const [srcCoords, piece] of this.#pieces)
      if (piece.color !== color && piece.getAttackedCoords(this, srcCoords).includes(kingCoords))
        return true;

    return false;
  }

  toString() {
    return Array
      .from({ length: 8 }, (_, y) => {
        let row = "";
        for (let x = 0; x < 8; x++)
          row += this.get(coords[x][y])?.initial ?? "0";
        return row;
      })
      .join("/")
      .replace(/0+/g, (zeros) => String(zeros.length));
  }

  toArray(): ChacoMat.JSONBoard {
    return Array.from({ length: 8 }, (_, y) => {
      return Array.from({ length: 8 }, (_, x) => {
        return this.get(coords[x][y])?.toJSON() ?? null;
      });
    });
  }

  clone() {
    const clone = new Board();
    this.#pieces.forEach((piece, coords) => clone.set(coords, piece));
    return clone;
  }

  /**
   * Get a board clone with pieces on opposite ranks or files or with colors reversed.
   */
  mirror({ horizontal, vertical, colors }: {
    /**
     * Swap files.
     */
    horizontal?: boolean;
    /**
     * Swap rank.
     */
    vertical?: boolean;
    /**
     * Reverse piece colors.
     */
    colors?: boolean;
  }) {
    const clone = new Board();
    this.#pieces.forEach((piece, key) => {
      const x = horizontal ? (8 - key.x - 1) : key.x;
      const y = vertical ? (8 - key.y - 1) : key.y;
      clone.set(coords[x][y], colors ? piece.opposite : piece);
    });
    return clone;
  }

  /**
   * Output the board to the console in following format:
   * ```
   * 8 | r n b q k b n r
   * 7 | p p p p p p p p
   * 6 | - - - - - - - -
   * 5 | - - - - - - - -
   * 4 | - - - - - - - -
   * 3 | - - - - - - - -
   * 2 | P P P P P P P P
   * 1 | R N B Q K B N R
   *     - - - - - - - -
   *     a b c d e f g h
   * ```
   */
  log() {
    console.log(
      this
        .toArray()
        .map((row, y) => {
          return `${Coords.yToRankName(y)} | ${row.map((piece) => piece?.initial ?? "-").join(" ")}`;
        })
        .join("\n")
      + "\n    _ _ _ _ _ _ _ _"
      + "\n    a b c d e f g h"
    );
  }
}