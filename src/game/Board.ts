import { colors, ConsoleColors } from "@chacomat/constants/Color.js";
import Piece from "@chacomat/pieces/Piece.js";
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

  static getChess960InitialBoard(piecePlacement: Record<NonPawnPieceType, number[]>): Board {
    const board = new Board();
    let pieceKey: keyof typeof piecePlacement;

    for (const color of colors) {
      const pieceRank = Piece.START_RANKS.PIECE[color];

      for (pieceKey in piecePlacement) {
        for (const y of piecePlacement[pieceKey]) {
          const index = coordsToIndex(pieceRank, y);
          board.set(index, new Piece({ color, board, index, type: pieceKey }));
        }
      }

      board.kings[color] = board.atRank(pieceRank).atFile(piecePlacement["K"][0]) as Piece;

      for (let y = 0; y < 8; y++) {
        const index = coordsToIndex(Piece.START_RANKS.PAWN[color], y);
        board.set(index, new Piece({ color, board, index, type: "P" }));
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
              const index = coordsToIndex(x, y);
              const piece = Piece.fromInitial(item as PieceInitial);
              piece.board = this;
              piece.index = index;
              this.set(index, piece);
              if (piece.isKing())
                this.kings[piece.color] = piece;
            });
        });
    }
  }

  atRank(rank: number) {
    return {
      atFile: (file: number) => this.get(coordsToIndex(rank, file))
    };
  }

  transfer(srcIndex: number, destIndex: number): this {
    const srcPiece = this.get(srcIndex) as Piece;
    this.set(destIndex, srcPiece).delete(srcIndex);
    srcPiece.index = destIndex;
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
    const boardClone = new Board();
    for (const [index, piece] of this) {
      boardClone.set(index, new Piece({
        color: piece.color,
        type: piece.type,
        index,
        board: boardClone
      }));
    }
    boardClone.kings.WHITE = boardClone.get(this.kings.WHITE.index);
    boardClone.kings.BLACK = boardClone.get(this.kings.BLACK.index);
    return boardClone;
  }

  getNonKingPiecesByColor(): BlackAndWhite<Piece[]> {
    return [...this.values()].reduce((acc, piece) => {
      if (!piece.isKing())
        acc[piece.color].push(piece);
      return acc;
    }, {
      WHITE: [] as Piece[],
      BLACK: [] as Piece[]
    });
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