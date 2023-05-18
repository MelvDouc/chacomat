import Colors from "@src/constants/Colors.js";
import { getCoords } from "@src/constants/Coords.js";
import Piece, { PieceInitials, PiecesByName } from "@src/constants/Piece.js";
import { attackedCoords, pseudoLegalMoves } from "@src/moves/legal-moves.js";
import { Color, Coordinates, HalfMove } from "@src/types.js";

export default class Board {
  static parse(boardStr: string): Board {
    return boardStr
      .split("/")
      .reduce((acc, row, x) => {
        row
          .replace(/\d+/g, (n) => "0".repeat(+n))
          .split("")
          .forEach((char, y) => {
            if (char !== "0")
              acc.set(
                (char === char.toUpperCase()) ? Colors.WHITE : Colors.BLACK,
                getCoords(x, y),
                PiecesByName[char as keyof typeof PiecesByName]
              );
          });
        return acc;
      }, new Board());
  }

  readonly #pieces: Record<Color, Map<Coordinates, Piece>>;
  readonly #kingCoords = {} as Record<Color, Coordinates>;

  constructor() {
    this.#pieces = {
      [Colors.WHITE]: new Map(),
      [Colors.BLACK]: new Map()
    };
  }

  getKingCoords(color: Color): Coordinates {
    return this.#kingCoords[color];
  }

  getCoordsAttackedByColor(color: Color) {
    const set = new Set<Coordinates>();

    for (const srcCoords of this.#pieces[color].keys())
      for (const destCoords of attackedCoords(srcCoords, color, this))
        set.add(destCoords);

    return set;
  }

  has(coords: Coordinates, color?: Color): boolean {
    if (color !== undefined)
      return this.#pieces[color].has(coords);
    return this.#pieces[Colors.WHITE].has(coords)
      || this.#pieces[Colors.BLACK].has(coords);
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
   * Minimum material to mate (irrespective of opponent material):
   * - a pawn
   * - a rook
   * - a queen
   * - two or more knights
   * - at least one bishop of each color
   */
  isInsufficientMaterial() {
    const [minPieces, maxPieces] = [
      [...this.#pieces[Colors.WHITE]].filter(([, piece]) => piece !== Piece.KING),
      [...this.#pieces[Colors.BLACK]].filter(([, piece]) => piece !== Piece.KING)
    ].sort((a, b) => a.length - b.length);

    if (minPieces.length === 0) {
      let parity: boolean | null = null;
      return maxPieces.length === 1 && maxPieces[0][1] === Piece.KNIGHT
        // 0 or more same-colored bishops
        || maxPieces.every(([{ x, y }, piece]) => {
          if (piece !== Piece.BISHOP)
            return false;
          if (parity === null)
            return (parity = (x % 2 === y % 2)), true;
          return (x % 2 === y % 2) === parity;
        });
    }

    if (minPieces.length === 1 && maxPieces.length === 1) {
      const [[coords, piece]] = minPieces;
      const [[oppCoords, oppPiece]] = maxPieces;
      return (piece === Piece.KNIGHT && oppPiece === Piece.KNIGHT)
        || (
          piece === Piece.BISHOP
          && oppPiece === Piece.BISHOP
          && (coords.x % 2 === coords.y % 2) === (oppCoords.x % 2 === oppCoords.y % 2)
        );
    }

    return false;
  }

  *pseudoLegalMoves(color: Color, enPassantCoords: Coordinates | null): Generator<HalfMove> {
    for (const srcCoords of this.#pieces[color].keys())
      for (const destCoords of pseudoLegalMoves(srcCoords, color, this, enPassantCoords))
        yield [srcCoords, destCoords];
  }

  toString(): string {
    return Array.from({ length: 8 }, (_, x) => {
      let row = "";

      y_loop: for (let y = 0; y < 8; y++) {
        const coords = getCoords(x, y);

        for (const color of Object.values(Colors)) {
          if (this.has(coords, color)) {
            row += PieceInitials[color][this.get(color, coords) as Piece];
            continue y_loop;
          }
        }

        row += "0";
      }

      return row.replace(/0+/g, (zeros) => String(zeros.length));
    }).join("/");
  }
}