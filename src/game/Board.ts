import Colors from "@src/constants/Colors.js";
import { getCoords } from "@src/constants/Coords.js";
import Piece, { PieceInitials } from "@src/constants/Piece.js";
import { attackedCoords } from "@src/moves/legal-moves.js";
import { Color, Coordinates } from "@src/types.js";

export default class Board {
  readonly #pieces: Record<Color, Map<Coordinates, Piece>>;
  readonly #kingCoords = {} as Record<Color, Coordinates>;
  #asString: string;

  constructor() {
    this.#pieces = {
      [Colors.WHITE]: new Map(),
      [Colors.BLACK]: new Map()
    };
  }

  get asString() {
    if (this.#asString)
      return this.#asString;

    return this.#asString = Array.from({ length: 8 }, (_, x) => {
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
    }).join("");
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
}