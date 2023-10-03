import Color from "@/board/Color.ts";
import { coords } from "@/board/Coords.ts";
import Piece from "@/pieces/Piece.ts";
import type { Coords, JSONBoard } from "@/typings/types.ts";

export default class Board {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

  static fromString(boardStr: string) {
    const board = new this();

    boardStr
      .replace(/\d+/g, (n) => "0".repeat(+n))
      .split("/")
      .forEach((row, x) => {
        row
          .split("")
          .forEach((initial, y) => {
            if (initial === "0") return;

            const piece = Piece.fromInitial(initial);
            if (!piece) throw new Error(`Unknown piece: ${initial}`);

            board.set(coords(x, y), piece);
          });
      });

    return board;
  }

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  readonly #pieces = new Map<Coords, Piece>();
  readonly #kingCoords = new Map<Color, Coords>();

  get pieces() {
    return this.#pieces;
  }

  *attackedCoords(srcCoords: Coords) {
    const srcPiece = this.#pieces.get(srcCoords)!;
    const { x: xOffsets, y: yOffsets } = srcPiece.offsets;

    if (srcPiece.isShortRange()) {
      for (let i = 0; i < xOffsets.length; i++) {
        const destCoords = srcCoords.peer(xOffsets[i], yOffsets[i]);
        if (destCoords)
          yield destCoords;
      }
      return;
    }

    for (let i = 0; i < xOffsets.length; i++) {
      for (const destCoords of srcCoords.peers(xOffsets[i], yOffsets[i])) {
        yield destCoords;
        if (this.has(destCoords)) break;
      }
    }
  }

  clone() {
    const clone = new Board();
    this.#pieces.forEach((piece, coords) => clone.set(coords, piece));
    return clone;
  }

  has(coords: Coords) {
    return this.#pieces.has(coords);
  }

  get(coords: Coords) {
    return this.#pieces.get(coords) ?? null;
  }

  delete(coords: Coords) {
    this.#pieces.delete(coords);
    return this;
  }

  set(coords: Coords, piece: Piece) {
    this.#pieces.set(coords, piece);
    if (piece.isKing()) this.#kingCoords.set(piece.color, coords);
    return this;
  }

  getKingCoords(color: Color) {
    return this.#kingCoords.get(color)!;
  }

  isColorInCheck(color: Color) {
    const kingCoords = this.getKingCoords(color);

    for (const [srcCoords, srcPiece] of this.#pieces)
      if (srcPiece.color !== color)
        for (const destCoords of this.attackedCoords(srcCoords))
          if (destCoords === kingCoords)
            return true;

    return false;
  }

  nonKingPieces() {
    return [...this.#pieces].reduce((acc, [coords, piece]) => {
      if (!piece.isKing())
        acc.get(piece.color)!.push([coords, piece]);
      return acc;
    }, new Map<Color, [Coords, Piece][]>([
      [Color.WHITE, []],
      [Color.BLACK, []]
    ]));
  }

  piecesOfColor(color: Color) {
    return [...this.#pieces].filter(([, piece]) => {
      return piece.color === color;
    });
  }

  toString() {
    return Array
      .from({ length: 8 }, (_, x) => {
        let row = "";
        for (let y = 0; y < 8; y++)
          row += this.get(coords(x, y))?.initial ?? "0";
        return row;
      })
      .join("/")
      .replace(/0+/g, (zeros) => String(zeros.length));
  }

  toArray(): JSONBoard {
    return Array.from({ length: 8 }, (_, x) => {
      return Array.from({ length: 8 }, (_, y) => {
        return this.get(coords(x, y))?.toJSON() ?? null;
      });
    });
  }
}