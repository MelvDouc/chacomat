import Coords from "@game/Coords.js";
import { Color } from "@utils/constants.js";
import Piece from "@pieces/index.js";
import type {
  BlackAndWhite,
  King,
  PieceInitial,
  Position
} from "../types.js";

export default class Board extends Map<Coords, Piece> {
  private static readonly nullPiece = "0";
  private static readonly nullPieceRegex = /0+/g;

  public position: Position;
  public readonly kings = {} as BlackAndWhite<King>;

  constructor(pieceStr?: string) {
    super();

    if (pieceStr) {
      pieceStr
        .split("/")
        .forEach((row, x) => {
          row
            .replace(/\d+/g, (num) => Board.nullPiece.repeat(+num))
            .split("")
            .forEach((item, y) => {
              if (item === Board.nullPiece)
                return;
              const coords = Coords.get(x, y);
              const piece = Piece.fromInitial(item as PieceInitial, this);
              piece.coords = coords;
              this.set(coords, piece);
              if (piece.isKing())
                this.kings[piece.color] = piece;
            });
        });
    }
  }

  public get Coords(): typeof Coords {
    return Coords;
  }

  public transfer(srcCoords: Coords, destCoords: Coords): this {
    const srcPiece = this.get(srcCoords)!;
    this.set(destCoords, srcPiece).delete(srcCoords);
    srcPiece.coords = destCoords;
    return this;
  }

  public getCoordsAttackedByColor(color: Color): Set<Coords> {
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
  public clone(): Board {
    const boardClone = new Board();
    for (const [coords, piece] of this) {
      const pieceClone = piece.clone();
      pieceClone.board = boardClone;
      boardClone.set(coords, pieceClone);
      if (pieceClone.isKing())
        boardClone.kings[piece.color] = pieceClone;
    }
    return boardClone;
  }

  /**
   * Get an bidimensional array representing the placement of each piece.
   * Empty squares are null.
   */
  public getPieceArray(): (Piece | null)[][] {
    return Array.from({ length: 8 }, (_, x) => {
      return Array.from({ length: 8 }, (_, y) => {
        return this.get(Coords.get(x, y)) ?? null;
      });
    });
  }

  /**
   * The board portion of an FEN string.
   */
  public override toString(): string {
    return Array
      .from({ length: 8 }, (_, x) => {
        return Array
          .from({ length: 8 }, (_, y) => this.get(Coords.get(x, y))?.initial ?? Board.nullPiece)
          .join("")
          .replace(Board.nullPieceRegex, (zeros) => String(zeros.length));
      })
      .join("/");
  }
}