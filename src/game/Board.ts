import Colors, { ConsoleColors } from "@src/constants/Colors.js";
import { getCoords } from "@src/constants/Coords.js";
import Piece, { PieceInitials, PiecesByName } from "@src/constants/Piece.js";
import { attackedCoords, pseudoLegalMoves } from "@src/moves/legal-moves.js";
import { Color, Coordinates, HalfMove, PieceInitial } from "@src/types.js";

export default class Board {
  static isLightSquare(coords: Coordinates): boolean {
    return coords.x % 2 === coords.y % 2;
  }

  readonly #pieces: Record<Color, Map<Coordinates, Piece>>;
  readonly #kingCoords = {} as Record<Color, Coordinates>;

  constructor(boardStr?: string) {
    this.#pieces = {
      [Colors.WHITE]: new Map(),
      [Colors.BLACK]: new Map()
    };

    if (boardStr)
      this.#parse(boardStr);
  }

  #parse(boardStr: string): void {
    boardStr.split("/").forEach((row, x) => {
      row
        .replace(/\d+/g, (n) => "0".repeat(+n))
        .split("")
        .forEach((char, y) => {
          if (char !== "0")
            this.set(
              (char === char.toUpperCase()) ? Colors.WHITE : Colors.BLACK,
              getCoords(x, y),
              PiecesByName[char as PieceInitial]
            );
        });
    });
  }

  getPieceInitialAt(coords: Coordinates): string | null {
    if (this.#pieces[Colors.WHITE].has(coords))
      return PieceInitials[Colors.WHITE][this.#pieces[Colors.WHITE].get(coords) as Piece];
    if (this.#pieces[Colors.BLACK].has(coords))
      return PieceInitials[Colors.BLACK][this.#pieces[Colors.BLACK].get(coords) as Piece];
    return null;
  }

  getKingCoords(color: Color): Coordinates {
    return this.#kingCoords[color];
  }

  getCoordsAttackedByColor(color: Color): Set<Coordinates> {
    const set = new Set<Coordinates>();

    for (const srcCoords of this.#pieces[color].keys())
      for (const destCoords of attackedCoords(srcCoords, color, this))
        set.add(destCoords);

    return set;
  }

  has(coords: Coordinates, color?: Color): boolean {
    if (!color)
      return this.#pieces[Colors.WHITE].has(coords)
        || this.#pieces[Colors.BLACK].has(coords);

    return this.#pieces[color].has(coords);
  }

  get(color: Color, coords: Coordinates): Piece | null {
    return this.#pieces[color].get(coords) ?? null;
  }

  set(color: Color, coords: Coordinates, piece: Piece): this {
    this.#pieces[color].set(coords, piece);
    if (piece === Piece.KING)
      this.#kingCoords[color] = coords;
    return this;
  }

  delete(color: Color, coords: Coordinates): void {
    this.#pieces[color].delete(coords);
  }

  clone(): Board {
    const clone = new Board();
    Object.values(Colors).forEach((color) => {
      this.#pieces[color].forEach((piece, coords) => {
        clone.set(color, coords, piece);
      });
    });
    return clone;
  }

  /**
   * Insufficient material is when:
   * - one side has a knight or bishop and the other side has no pieces;
   * - both sides only have a bishop of the same color.
   */
  isInsufficientMaterial(): boolean {
    const [minPieces, maxPieces] = [
      [...this.#pieces[Colors.WHITE]].filter(([, piece]) => piece !== Piece.KING),
      [...this.#pieces[Colors.BLACK]].filter(([, piece]) => piece !== Piece.KING)
    ].sort((a, b) => a.length - b.length);

    if (maxPieces.length === 0)
      return true;

    if (maxPieces.length === 1) {
      const [[coords, piece]] = maxPieces;

      if (minPieces.length === 0)
        return piece === Piece.KNIGHT || piece === Piece.BISHOP;

      if (minPieces.length === 1) {
        const [[oppCoords, oppPiece]] = minPieces;

        return piece === Piece.BISHOP
          && oppPiece === Piece.BISHOP
          && Board.isLightSquare(coords) === Board.isLightSquare(oppCoords);
      }
    }

    return false;
  }

  *pseudoLegalMoves(color: Color, enPassantCoords: Coordinates | null): Generator<HalfMove> {
    for (const srcCoords of this.#pieces[color].keys())
      for (const destCoords of pseudoLegalMoves(srcCoords, color, this, enPassantCoords))
        yield [srcCoords, destCoords];
  }

  toString(): string {
    return this.toArray()
      .map((row) => {
        return row
          .map((initial) => initial || "0")
          .join("")
          .replace(/0+/g, (zeros) => String(zeros.length));
      })
      .join("/");
  }

  toArray(): string[][] {
    return Array.from({ length: 8 }, (_, x) => {
      return Array.from({ length: 8 }, (_, y) => {
        const coords = getCoords(x, y);
        return this.getPieceInitialAt(coords) ?? "";
      });
    });
  }

  log(): void {
    console.log(
      this.toArray()
        .map((row, x) => {
          return row
            .map((initial, y) => {
              const bgColor = (x % 2 === y % 2) ? ConsoleColors.BG_WHITE : ConsoleColors.BG_GREEN;
              return `${bgColor + ConsoleColors.FG_BLACK} ${initial || " "} ${ConsoleColors.RESET}`;
            })
            .join("");
        })
        .join("/")
    );
  }
}