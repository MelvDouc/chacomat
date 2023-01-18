import Coords from "@chacomat/game/Coords.js";
import Color from "@chacomat/utils/Color.js";
import fenChecker from "@chacomat/utils/fen-checker.js";
import { ConsoleColors } from "@chacomat/utils/Color.js";
import Piece from "@chacomat/pieces/Piece.js";
import type {
  BlackAndWhite,
  PieceInitial,
  Position
} from "@chacomat/types.js";

export default class Board extends Map<Coords, Piece> {
  static readonly #nullPiece = "0";
  static readonly #nullPieceRegex = /0+/g;

  position: Position;
  readonly kings = {} as BlackAndWhite<Piece>;

  constructor(pieceStr?: string) {
    super();

    if (pieceStr) {
      pieceStr
        .split(fenChecker.rowSeparator)
        .forEach((row, x) => {
          row
            .replace(/\d+/g, (num) => Board.#nullPiece.repeat(+num))
            .split("")
            .forEach((item, y) => {
              if (item === Board.#nullPiece)
                return;
              const coords = Coords.get(x, y);
              const piece = Piece.fromInitial(item as PieceInitial);
              piece.board = this;
              piece.coords = coords;
              this.set(coords, piece);
              if (piece.isKing())
                this.kings[piece.color] = piece;
            });
        });
    }
  }

  get Coords(): typeof Coords {
    return Coords;
  }

  getRank(rank: number) {
    return {
      getFile: (file: number) => this.get(Coords.get(rank, file))
    };
  }

  transfer(srcCoords: Coords, destCoords: Coords): this {
    const srcPiece = this.get(srcCoords)!;
    this.set(destCoords, srcPiece).delete(srcCoords);
    srcPiece.coords = destCoords;
    return this;
  }

  getCoordsAttackedByColor(color: Color): Set<Coords> {
    const set = new Set<Coords>();

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
    const boardClone = new Board();
    for (const [coords, piece] of this) {
      boardClone.set(coords, new Piece({
        color: piece.color,
        type: piece.type,
        coords,
        board: boardClone
      }));
    }
    boardClone.kings[Color.WHITE] = boardClone.get(this.kings[Color.WHITE].coords)!;
    boardClone.kings[Color.BLACK] = boardClone.get(this.kings[Color.BLACK].coords)!;
    return boardClone;
  }

  getNonKingPiecesByColor(): BlackAndWhite<Piece[]> {
    return [...this.values()].reduce((acc, piece) => {
      if (!piece.isKing())
        acc[piece.color].push(piece);
      return acc;
    }, {
      [Color.WHITE]: [] as Piece[],
      [Color.BLACK]: [] as Piece[]
    });
  }

  /**
   * Get an bidimensional array representing the placement of each piece.
   * Empty squares are null.
   */
  getPieceArray(): (Piece | null)[][] {
    return Array.from({ length: 8 }, (_, x) => {
      return Array.from({ length: 8 }, (_, y) => {
        return this.get(Coords.get(x, y)) ?? null;
      });
    });
  }

  log(): void {
    console.log(
      Array
        .from({ length: 8 }, (_, x) => {
          let row = "";
          for (let y = 0; y < 8; y++) {
            const char = this.get(this.Coords.get(x, y))?.initial ?? " ";
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
          .from({ length: 8 }, (_, y) => this.get(Coords.get(x, y))?.initial ?? Board.#nullPiece)
          .join("")
          .replace(Board.#nullPieceRegex, (zeros) => String(zeros.length));
      })
      .join(fenChecker.rowSeparator);
  }
}