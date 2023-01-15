import Coords from "@game/Coords.js";
import { Color, Wing } from "@utils/constants.js";
import Piece from "@pieces/index.js";
import type {
  BlackAndWhite,
  CastlingRights,
  King,
  PieceInitial,
  Position,
  Wings
} from "../types.js";

export default class Board extends Map<Coords, Piece> {
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
            const coords = Coords.get(x, y);
            const piece = Piece.fromInitial(item as PieceInitial, acc);
            piece.coords = coords;
            acc.set(coords, piece);
            if (piece.isKing())
              acc.kings[piece.color] = piece;
          });
        return acc;
      }, new Board());
  }

  public position: Position;
  public readonly kings = {} as BlackAndWhite<King>;
  public startRookFiles: Wings<number> = {
    [Wing.QUEEN_SIDE]: Wing.QUEEN_SIDE,
    [Wing.KING_SIDE]: Wing.KING_SIDE
  };

  public get Coords(): typeof Coords {
    return Coords;
  }

  /**
   * Infer initial rook files in a Chess960 game based on castling rights.
   * @returns Whether the placement of the rooks matches the given castling rights.
   */
  public updateStartRookFiles(castlingRights: CastlingRights): boolean {
    main: for (const wing of [Wing.QUEEN_SIDE, Wing.KING_SIDE]) {
      const direction = Math.sign(4 - wing);
      for (const color of [Color.WHITE, Color.BLACK]) {
        if (!castlingRights[color][wing])
          continue;
        for (let y = wing; y !== this.kings[color].coords.y; y += direction) {
          const piece = this.get(Coords.get(Piece.startPieceRanks[color], y)!);
          if (piece?.isRook() && piece.color === color) {
            this.startRookFiles[wing] = y;
            continue main;
          }
        }
        return false;
      }
    }

    return true;
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
      boardClone.set(coords, piece.clone(boardClone));
      if (piece.isKing())
        boardClone.kings[piece.color] = boardClone.get(coords) as King;
    }
    boardClone.startRookFiles = { ...this.startRookFiles };
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