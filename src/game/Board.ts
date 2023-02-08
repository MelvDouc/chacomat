import { colors, ConsoleColors } from "@chacomat/constants/Color.js";
import Piece, { King, Pawn } from "@chacomat/pieces/index.js";
import type {
  BlackAndWhite,
  Color,
  NonPawnPieceType,
  PieceInitial,
  Position
} from "@chacomat/types.local.js";
import fenChecker from "@chacomat/utils/fen-checker.js";
import { coordsToIndex } from "@chacomat/utils/Index.js";

export default class Board extends Map<number, Piece> {
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
        const index = coordsToIndex(x, y);
        const piece = Piece.fromInitial(initial as PieceInitial);
        board.set(index, piece.setBoard(board).setIndex(index));
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
          const index = coordsToIndex(pieceRank, y);
          const type = Piece.pieceClassesByInitial.get(pieceInitial) as typeof King;
          board.set(index, new (type)(color).setIndex(index).setBoard(board));
        }
      }

      board.kings[color] = board.atRank(pieceRank).atFile(piecePlacement["K"][0]) as King;

      for (let y = 0; y < 8; y++) {
        const index = coordsToIndex(Pawn.START_RANKS[color], y);
        board.set(index, new Pawn(color).setIndex(index).setBoard(board));
      }
    }

    return board;
  }

  position: Position;
  #enPassantIndex = -1;
  readonly kings = {} as BlackAndWhite<King>;

  getEnPassantIndex(): number {
    return this.#enPassantIndex;
  }

  setEnPassantIndex(index: number): this {
    this.#enPassantIndex = index;
    return this;
  }

  atRank(rank: number) {
    return {
      atFile: (file: number) => this.get(coordsToIndex(rank, file))
    };
  }

  transfer(srcIndex: number, destIndex: number): this {
    const srcPiece = this.get(srcIndex) as Piece;
    this.set(destIndex, srcPiece.setIndex(destIndex)).delete(srcIndex);
    return this;
  }

  getCoordsAttackedByColor(color: Color): Set<number> {
    const set = new Set<number>();

    for (const piece of this.values())
      if (piece.color === color)
        for (const destIndex of piece.attackedIndices())
          set.add(destIndex);

    return set;
  }

  /**
   * Clones this instance and every piece it contains.
   */
  clone(): Board {
    const boardClone = new Board().setEnPassantIndex(this.#enPassantIndex);
    for (const [index, piece] of this) {
      boardClone.set(
        index,
        piece.clone().setIndex(index).setBoard(boardClone)
      );
    }
    boardClone.kings.WHITE = boardClone.get(this.kings.WHITE.getIndex()) as King;
    boardClone.kings.BLACK = boardClone.get(this.kings.BLACK.getIndex()) as King;
    return boardClone;
  }

  /**
   * Get an bidimensional array representing the placement of each piece.
   * Empty squares are null.
   */
  toArray(): (Piece | null)[][] {
    return Array.from({ length: 8 }, (_, x) => {
      return Array.from({ length: 8 }, (_, y) => {
        return this.atRank(x).atFile(y) ?? null;
      });
    });
  }

  log(): void {
    console.log(
      Array
        .from({ length: 8 }, (_, x) => {
          let row = "";
          for (let y = 0; y < 8; y++) {
            const char = this.atRank(x).atFile(y)?.initial ?? " ";
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
          .from({ length: 8 }, (_, y) => this.atRank(x).atFile(y)?.initial ?? Board.#nullPiece)
          .join("")
          .replace(Board.#nullPieceRegex, (zeros) => String(zeros.length));
      })
      .join(fenChecker.rowSeparator);
  }
}