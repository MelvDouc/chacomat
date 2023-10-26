import Coords, { coords } from "@/board/Coords.ts";
import Piece from "@/pieces/Piece.ts";
import { ChacoMat } from "@/typings/chacomat.ts";

export default class Board {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

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

  get pieces() {
    return this.#pieces;
  }

  clone() {
    const clone = new Board();
    this.#pieces.forEach((piece, coords) => clone.set(coords, piece));
    return clone;
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

  getAttackedCoordsSet(color: ChacoMat.Color) {
    const set = new Set<ChacoMat.Coords>();

    for (const [srcCoords, piece] of this.#pieces)
      if (piece.color === color)
        for (const destCoords of piece.attackedCoords(this, srcCoords))
          set.add(destCoords);

    return set;
  }

  isColorInCheck(color: ChacoMat.Color) {
    const kingCoords = this.getKingCoords(color);

    for (const [srcCoords, piece] of this.#pieces)
      if (piece.color !== color)
        for (const destCoords of piece.attackedCoords(this, srcCoords))
          if (destCoords === kingCoords)
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

  /**
   * Get a board clone with colors reversed.
   */
  swapColors() {
    const clone = new Board();
    this.#pieces.forEach((piece, coords) => {
      clone.set(coords, piece.opposite);
    });
    return clone;
  }

  /**
   * Get a board clone with colors reversed.
   */
  mirrorHorizontally() {
    const clone = new Board();
    this.#pieces.forEach((piece, { x, y }) => {
      clone.set(coords[8 - x - 1][y], piece);
    });
    return clone;
  }

  mirrorVertically() {
    const clone = new Board();
    this.#pieces.forEach((piece, { x, y }) => {
      clone.set(coords[x][8 - y - 1], piece);
    });
    return clone;
  }

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