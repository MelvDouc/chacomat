import { colors, ConsoleColors } from "@chacomat/constants/Color.js";
import King from "@chacomat/pieces/King.js";
import Knight from "@chacomat/pieces/Knight.js";
import Pawn from "@chacomat/pieces/Pawn.js";
import Piece from "@chacomat/pieces/Piece.js";
import Bishop from "@chacomat/pieces/sliding/Bishop.js";
import Queen from "@chacomat/pieces/sliding/Queen.js";
import Rook from "@chacomat/pieces/sliding/Rook.js";
import type {
  BlackAndWhite,
  Color,
  NonPawnPieceType,
  Position,
  WhitePieceInitial
} from "@chacomat/types.local.js";
import fenChecker from "@chacomat/utils/fen-checker.js";
import { coordsToIndex } from "@chacomat/utils/Index.js";

export default class Board extends Map<number, Piece> {
  static readonly #nullPiece = "0";
  static readonly #nullPieceRegex = /0+/g;
  static readonly pieceTypesByInitial = {
    [Pawn.whiteInitial]: Pawn,
    [Knight.whiteInitial]: Knight,
    [King.whiteInitial]: King,
    [Bishop.whiteInitial]: Bishop,
    [Rook.whiteInitial]: Rook,
    [Queen.whiteInitial]: Queen
  };

  static getChess960InitialBoard(piecePlacement: Record<NonPawnPieceType, number[]>): Board {
    const board = new Board();
    let pieceKey: keyof typeof piecePlacement;

    for (const color of colors) {
      const pieceRank = Piece.START_RANKS[color];

      for (pieceKey in piecePlacement) {
        for (const y of piecePlacement[pieceKey]) {
          const index = coordsToIndex(pieceRank, y);
          const type = this.pieceTypesByInitial[pieceKey];
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
              const pieceType = Board.pieceTypesByInitial[item as WhitePieceInitial];
              const color = item === item.toUpperCase() ? "WHITE" : "BLACK";
              const piece = new (pieceType)(color).setBoard(this).setIndex(index);
              this.set(index, piece);
              if (piece.pieceName === "King")
                this.kings[piece.color] = piece as King;
            });
        });
    }
  }

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
    const boardClone = new Board();
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

  getNonKingPiecesByColor(): BlackAndWhite<Piece[]> {
    return [...this.values()].reduce((acc, piece) => {
      if (piece.pieceName !== "King")
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