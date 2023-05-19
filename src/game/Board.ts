import Colors, { ConsoleColors } from "@src/constants/Colors.js";
import { getCoords } from "@src/constants/Coords.js";
import Piece, { PieceInitials, PiecesByName } from "@src/constants/Piece.js";
import { attackedCoords, pseudoLegalMoves } from "@src/moves/legal-moves.js";
import { Color, Coordinates, HalfMove } from "@src/types.js";

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
              PiecesByName[char as keyof typeof PiecesByName]
            );
        });
    });
  }

  getPieceInitialAt(coords: Coordinates) {
    if (this.#pieces[Colors.WHITE].has(coords))
      return PieceInitials[Colors.WHITE][this.#pieces[Colors.WHITE].get(coords) as Piece];
    if (this.#pieces[Colors.BLACK].has(coords))
      return PieceInitials[Colors.BLACK][this.#pieces[Colors.BLACK].get(coords) as Piece];
    return null;
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
   * Insufficient material is when:
   * - neither side has pieces;
   * - one side has no pieces and the other side only has a knight or same-colored bishops;
   * - one side only has a bishop and the other side only has a bishop of the same color.
   */
  isInsufficientMaterial(): boolean {
    const [minPieces, maxPieces] = [
      [...this.#pieces[Colors.WHITE]].filter(([, piece]) => piece !== Piece.KING),
      [...this.#pieces[Colors.BLACK]].filter(([, piece]) => piece !== Piece.KING)
    ].sort((a, b) => a.length - b.length);

    if (minPieces.length === 0) {
      let isLightSquare: boolean;
      return maxPieces.length === 1 && maxPieces[0][1] === Piece.KNIGHT
        // 0 or more same-colored bishops (also true if no pieces)
        || maxPieces.every(([coords, piece]) => {
          if (piece !== Piece.BISHOP)
            return false;
          isLightSquare ??= Board.isLightSquare(coords);
          return Board.isLightSquare(coords) === isLightSquare;
        });
    }

    if (minPieces.length === 1 && maxPieces.length === 1) {
      const [[coords, piece]] = minPieces;
      const [[oppCoords, oppPiece]] = maxPieces;
      return piece === Piece.BISHOP
        && oppPiece === Piece.BISHOP
        && Board.isLightSquare(coords) === Board.isLightSquare(oppCoords);
    }

    return false;
  }

  *pseudoLegalMoves(color: Color, enPassantCoords: Coordinates | null): Generator<HalfMove> {
    for (const srcCoords of this.#pieces[color].keys())
      for (const destCoords of pseudoLegalMoves(srcCoords, color, this, enPassantCoords))
        yield [srcCoords, destCoords];
  }

  toString(): string {
    let boardStr = "";

    for (let x = 0; x < 8; x++) {
      let row = "";

      for (let y = 0; y < 8; y++)
        row += this.getPieceInitialAt(getCoords(x, y)) ?? "0";

      boardStr += row.replace(/0+/g, (zeros) => String(zeros.length));
      if (x < 8 - 1) boardStr += "/";
    }

    return boardStr;
  }

  log(): void {
    console.log(
      Array.from({ length: 8 }, (_, x) => {
        return Array.from({ length: 8 }, (_, y) => {
          const bgColor = (x % 2 === y % 2) ? ConsoleColors.BG_WHITE : ConsoleColors.BG_GREEN;
          const initial = this.getPieceInitialAt(getCoords(x, y)) ?? " ";
          return `${bgColor + ConsoleColors.FG_BLACK} ${initial} ${ConsoleColors.RESET}`;
        }).join("");
      }).join("\n")
    );
  }
}