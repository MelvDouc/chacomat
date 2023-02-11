import { ConsoleColors } from "@chacomat/constants/Color.js";
import Piece from "@chacomat/pieces/index.js";
import type {
  BlackAndWhite,
  Color,
  King,
  PieceInitial,
  Position
} from "@chacomat/types.local.js";
import Coords from "@chacomat/utils/Coords.js";
import fenChecker from "@chacomat/utils/fen-checker.js";

export default class Board extends Map<Coords, Piece> {
  static readonly #nullPiece = "0";
  static readonly #nullPieceRegex = /0+/g;

  static fromString(pieceStr: string): Board {
    const board = new this();
    const rows = pieceStr.split(fenChecker.rowSeparator);

    for (let x = 0; x < 8; x++) {
      const row = rows[x].replace(/\d+/g, (n) => Board.#nullPiece.repeat(+n));

      for (let y = 0; y < 8; y++) {
        const initial = row[y];
        if (initial === Board.#nullPiece) continue;
        const piece = Piece.fromInitial(initial as PieceInitial);
        piece.board = board;
        board.set(Coords.get(x, y), piece);
        if (piece.isKing())
          board.kings[piece.color] = piece;
      }
    }

    if (!board.kings.WHITE)
      throw new Error("Board is missing a white king.");
    if (!board.kings.BLACK)
      throw new Error("Board is missing a black king.");

    return board;
  }

  enPassantY = -1;
  position: Position;
  readonly kings = {} as BlackAndWhite<King>;

  override set(coords: Coords, piece: Piece): this {
    piece.coords = coords;
    return super.set(coords, piece);
  }

  atX(x: number) {
    return {
      atY: (y: number) => this.get(Coords.get(x, y))
    };
  }

  transfer(piece: Piece, destCoords: Coords): void {
    this.delete(piece.coords);
    this.set(destCoords, piece);
  }

  getCoordsAttackedByColor(color: Color): WeakSet<Coords> {
    const set = new WeakSet<Coords>();

    for (const piece of this.values())
      if (piece.color === color)
        for (const destCoords of piece.attackedCoords())
          set.add(destCoords);

    return set;
  }

  /**
   * Clones this instance and every piece it contains.
   */
  clone(): Board {
    const boardClone = new (<typeof Board>this.constructor)();
    boardClone.enPassantY = this.enPassantY;
    this.forEach((piece, coords) => {
      const pieceClone = piece.clone();
      pieceClone.board = boardClone;
      boardClone.set(coords, pieceClone);
    });
    boardClone.kings.WHITE = boardClone.get(this.kings.WHITE.coords) as King;
    boardClone.kings.BLACK = boardClone.get(this.kings.BLACK.coords) as King;
    return boardClone;
  }

  /**
   * Get an bidimensional array representing the placement of each piece.
   * Empty squares are null.
   */
  toArray(): (Piece | null)[][] {
    return Array.from({ length: 8 }, (_, x) => {
      return Array.from({ length: 8 }, (_, y) => {
        return this.atX(x).atY(y) ?? null;
      });
    });
  }

  log(): void {
    console.log(
      Array
        .from({ length: 8 }, (_, x) => {
          let row = "";
          for (let y = 0; y < 8; y++) {
            const char = this.atX(x).atY(y)?.initial ?? " ";
            const bgColor = (x % 2 === y % 2) ? ConsoleColors.BgWhite : ConsoleColors.BgGreen;
            row += `${bgColor + ConsoleColors.FgBlack} ${char} ${ConsoleColors.Reset}`;
          }
          return `  ${row}`;
        })
        .join("\n")
    );
  }

  /**
   * The board portion of an FEN string.
   */
  override toString(): string {
    return Array
      .from({ length: 8 }, (_, x) => {
        return Array
          .from({ length: 8 }, (_, y) => this.atX(x).atY(y)?.initial ?? Board.#nullPiece)
          .join("")
          .replace(Board.#nullPieceRegex, (zeros) => String(zeros.length));
      })
      .join(fenChecker.rowSeparator);
  }
}