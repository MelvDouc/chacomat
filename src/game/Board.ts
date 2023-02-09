import { colors, ConsoleColors } from "@chacomat/constants/Color.js";
import Piece, { King, Pawn } from "@chacomat/pieces/index.js";
import type {
  BlackAndWhite,
  Color,
  NonPawnPieceType,
  PieceInitial,
  Position
} from "@chacomat/types.local.js";
import Coords from "@chacomat/utils/Coords.js";
import fenChecker from "@chacomat/utils/fen-checker.js";

export default class Board extends Map<Coords, Piece> {
  static readonly #nullPiece = "0";
  static readonly #nullPieceRegex = /0+/g;

  static fromString(pieceStr: string): Board {
    const board = new Board();
    const rows = pieceStr.split(fenChecker.rowSeparator);

    for (let x = 0; x < 8; x++) {
      const row = rows[x].replace(/\d+/g, (n) => Board.#nullPiece.repeat(+n));

      for (let y = 0; y < 8; y++) {
        const initial = row[y];
        if (initial === Board.#nullPiece) continue;
        const coords = Coords.get(x, y);
        const piece = Piece.fromInitial(initial as PieceInitial) as Piece;
        piece.coords = coords;
        piece.board = board;
        board.set(coords, piece);
        if (piece instanceof King)
          board.kings[piece.color] = piece;
      }
    }

    if (!board.kings.WHITE)
      throw new Error("Board is missing a white king.");
    if (!board.kings.BLACK)
      throw new Error("Board is missing a black king.");

    return board;
  }

  static getChess960InitialBoard(piecePlacement: Record<NonPawnPieceType, number[]>): Board {
    const board = new Board();
    let pieceInitial: keyof typeof piecePlacement;

    for (const color of colors) {
      const pieceRank = Piece.START_RANKS[color];

      for (pieceInitial in piecePlacement) {
        for (const y of piecePlacement[pieceInitial]) {
          const coords = Coords.get(pieceRank, y);
          const type = Piece.pieceClassesByInitial.get(pieceInitial) as typeof King;
          const piece = new (type)(color);
          piece.coords = coords;
          piece.board = board;
          board.set(coords, piece);
        }
      }

      board.kings[color] = board.atX(pieceRank).atY(piecePlacement["K"][0]) as King;

      for (let y = 0; y < 8; y++) {
        const coords = Coords.get(Pawn.START_RANKS[color], y);
        const pawn = new Pawn(color);
        pawn.coords = coords;
        pawn.board = board;
        board.set(coords, new Pawn(color));
      }
    }

    return board;
  }

  #squares = new Map<Coords, Piece>();
  enPassantY = -1;
  position: Position;
  readonly kings = {} as BlackAndWhite<King>;

  atX(x: number) {
    return {
      atY: (y: number) => this.get(Coords.get(x, y))
    };
  }

  transfer(srcCoords: Coords, destCoords: Coords): this {
    const srcPiece = this.get(srcCoords) as Piece;
    srcPiece.coords = destCoords;
    this.set(destCoords, srcPiece).delete(srcCoords);
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
    boardClone.enPassantY = this.enPassantY;
    this.forEach((piece, coords) => {
      const pieceClone = piece.clone();
      pieceClone.coords = coords;
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