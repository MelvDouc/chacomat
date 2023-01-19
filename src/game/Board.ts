import Coords from "@chacomat/game/Coords.js";
import Piece from "@chacomat/pieces/Piece.js";
import type {
  BlackAndWhite,
  NonPawnPieceType,
  PieceInitial, Position
} from "@chacomat/types.js";
import Color, { ConsoleColors } from "@chacomat/utils/Color.js";
import fenChecker from "@chacomat/utils/fen-checker.js";

export default class Board extends Map<Coords, Piece> {
  static readonly #nullPiece = "0";
  static readonly #nullPieceRegex = /0+/g;

  static getChess960InitialBoard(piecePlacement: Record<NonPawnPieceType, number[]>): Board {
    const board = new Board();
    let colorKey: keyof typeof Color,
      pieceKey: keyof typeof piecePlacement;

    for (colorKey in Color) {
      const color = Color[colorKey];
      const pieceRank = Piece.START_RANKS.PIECE[color];

      for (pieceKey in piecePlacement) {
        for (const y of piecePlacement[pieceKey]) {
          const coords = Coords(pieceRank, y);
          board.set(coords, new Piece({ color, board, coords, type: pieceKey }));
        }
      }

      board.kings[color] = board.getRank(pieceRank).getFile(piecePlacement[Piece.TYPES.KING][0]) as Piece;

      for (let y = 0; y < 8; y++) {
        const coords = Coords(Piece.START_RANKS.PAWN[color], y);
        board.set(coords, new Piece({ color, board, coords, type: Piece.TYPES.PAWN }));
      }
    }

    return board;
  }

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
              const coords = Coords(x, y);
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
      getFile: (file: number) => this.get(Coords(rank, file))
    };
  }

  transfer(srcCoords: Coords, destCoords: Coords): this {
    const srcPiece = this.get(srcCoords) as Piece;
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
        return this.get(Coords(x, y)) ?? null;
      });
    });
  }

  log(): void {
    console.log(
      Array
        .from({ length: 8 }, (_, x) => {
          let row = "";
          for (let y = 0; y < 8; y++) {
            const char = this.get(this.Coords(x, y))?.initial ?? " ";
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
          .from({ length: 8 }, (_, y) => this.get(Coords(x, y))?.initial ?? Board.#nullPiece)
          .join("")
          .replace(Board.#nullPieceRegex, (zeros) => String(zeros.length));
      })
      .join(fenChecker.rowSeparator);
  }
}