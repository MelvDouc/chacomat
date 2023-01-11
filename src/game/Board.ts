import Color from "../constants/Color.js";
import Coords from "../constants/Coords.js";
import Piece from "../pieces/Piece.js";
import type { AttackedCoordsRecord as AttackedCoordsSet, BlackAndWhite, PieceInitial } from "../types.js";

export default class Board {
  private static readonly nullPiece = "0";
  private static readonly nullPieceRegex = /0+/g;

  /**
   * @param {string} pieceStr The portion of an FEN string representing the board.
   * @returns A new instance of this.
   */
  public static fromPieceString(pieceStr: string): Board {
    return pieceStr
      .split("/")
      .reduce((acc, row, x) => {
        row
          .replace(/\d+/g, (num) => Board.nullPiece.repeat(+num))
          .split("")
          .forEach((item, y) => {
            if (item === Board.nullPiece)
              return;
            const piece = Piece.fromInitial(item as PieceInitial),
              coords = Coords.get(x, y)!;
            acc.set(coords, piece);
            if (piece.whiteInitial === "K")
              acc.kingCoords[piece.color] = coords;
          });
        return acc;
      }, new Board());
  }

  private readonly squares: Map<Coords, Piece> = new Map();
  public readonly kingCoords: BlackAndWhite<Coords> = {} as BlackAndWhite<Coords>;

  public get pieceCount(): number {
    return this.squares.size;
  }

  public get(coords: Coords): Piece | null {
    return this.squares.get(coords) ?? null;
  }

  public set(coords: Coords, value: Piece): this {
    this.squares.set(coords, value);
    return this;
  }

  public unset(coords: Coords): void {
    this.squares.delete(coords);
  }

  public getCoordsAttackedByColor(color: Color): AttackedCoordsSet {
    const set: AttackedCoordsSet = new Set();

    for (const [srcCoords, piece] of this.squares)
      if (piece.color === color)
        for (const destCoords of piece.attackedCoords(srcCoords, this))
          set.add(destCoords);

    return set;
  }

  /**
   * Clones this instance and every piece it contains.
   */
  public clone(): Board {
    const clone = new Board();
    for (const [coords, piece] of this.squares)
      clone.set(coords, piece);
    clone.kingCoords[Color.WHITE] = this.kingCoords[Color.WHITE];
    clone.kingCoords[Color.BLACK] = this.kingCoords[Color.BLACK];
    return clone;
  }

  /**
   * The board portion of an FEN string.
   */
  public toString(): string {
    return Array
      .from({ length: 8 }, (_, x) => {
        return Array
          .from({ length: 8 }, (_, y) => this.squares.get(Coords.get(x, y)!)?.initial ?? Board.nullPiece)
          .join("")
          .replace(Board.nullPieceRegex, (zeros) => String(zeros.length));
      })
      .join("/");
  }

  public toReadableBoardString(): string {
    return Array
      .from({ length: 8 }, (_, x) => {
        return Array
          .from({ length: 8 }, (_, y) => this.squares.get(Coords.get(x, y)!)?.initial ?? "-")
          .join(" ");
      })
      .join("\n");
  }
}