import Color from "../constants/Color.js";
import Piece from "../pieces/Piece.js";
import type { AttackedCoordsRecord, BlackAndWhite, Coords, PieceInitial } from "../types.js";

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
            const piece = Piece.fromInitial(item as PieceInitial);
            acc.set({ x, y }, piece);
            if (piece.whiteInitial === "K")
              acc.kingCoords[piece.color] = { x, y };
          });
        return acc;
      }, new Board());
  }

  private readonly squares: Array<Array<Piece | null>> = Array.from(
    { length: 8 },
    () => Array(8).fill(null)
  );
  public readonly kingCoords: BlackAndWhite<Coords> = {} as BlackAndWhite<Coords>;

  public get pieceCount(): number {
    return this.squares.reduce((total, row) => {
      for (const item of row)
        if (item)
          total++;
      return total;
    }, 0);
  }

  public get({ x, y }: Coords): Piece | null {
    return this.squares[x][y];
  }

  public set({ x, y }: Coords, value: Piece): this {
    this.squares[x][y] = value;
    return this;
  }

  public unset({ x, y }: Coords): void {
    this.squares[x][y] = null;
  }

  public getCoordsAttackedByColor(color: Color): AttackedCoordsRecord {
    const record: AttackedCoordsRecord = {};

    for (let x = 0; x < 8; x++)
      for (let y = 0; y < 8; y++)
        if (this.squares[x][y]?.color === color)
          for (const coords of this.squares[x][y]!.attackedCoords({ x, y }, this)) {
            record[coords.x] ??= {};
            record[coords.x][coords.y] = true;
          }

    return record;
  }

  /**
   * Clones this instance and every piece it contains.
   */
  public clone(): Board {
    const clone = new Board();
    for (let x = 0; x < 8; x++)
      for (let y = 0; y < 8; y++)
        if (this.squares[x][y])
          clone.set({ x, y }, this.squares[x][y]!.clone());
    clone.kingCoords[Color.WHITE] = this.kingCoords[Color.WHITE];
    clone.kingCoords[Color.BLACK] = this.kingCoords[Color.BLACK];
    return clone;
  }

  /**
   * The board portion of an FEN string.
   */
  public toString(): string {
    return this.squares
      .map((row) => row
        .map((item) => item?.initial ?? Board.nullPiece)
        .join("")
        .replace(Board.nullPieceRegex, (zeros) => String(zeros.length))
      )
      .join("/");
  }

  public toReadableBoardString(): string {
    return this.squares
      .map((row) => row.map((item) => item?.initial ?? " ").join(" "))
      .join("\n");
  }
}