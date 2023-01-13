import Coords from "./Coords.js";
import Color from "../constants/Color.js";
import Wing from "../constants/Wing.js";
import Piece from "../pieces/Piece.js";
import type {
  BlackAndWhite,
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
            const piece = Piece.fromInitial(item as PieceInitial),
              coords = Coords.get(x, y)!;
            piece.coords = coords;
            acc.set(coords, piece);
            if (piece.whiteInitial === "K")
              acc.kings[piece.color] = piece as King;
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

  public get rookFiles(): { [W in Wing]: number } {
    const rookFiles: number[] = [];
    for (let y = 0; y < 8; y++)
      if (this.get(Coords.get(7, y)!)?.whiteInitial === "R")
        rookFiles.push(y);
    return {
      [Wing.QUEEN_SIDE]: Math.min(...rookFiles),
      [Wing.KING_SIDE]: Math.max(...rookFiles)
    };
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
        for (const destCoords of piece.attackedCoords(this))
          set.add(destCoords);

    return set;
  }

  /**
   * Clones this instance and every piece it contains.
   */
  public clone(): Board {
    const clone = new Board();
    for (const [coords, piece] of this) {
      clone.set(coords, piece.clone());
      if (piece.whiteInitial === "K")
        clone.kings[piece.color] = clone.get(coords) as King;
    }
    clone.startRookFiles = this.startRookFiles;
    return clone;
  }

  /**
   * Get an bidimensional array representing the placement of each piece.
   * Empty squares are null.
   */
  public getPieceArray(): (Piece | null)[][] {
    return Array.from({ length: 8 }, (_, x) => {
      return Array.from({ length: 8 }, (_, y) => {
        return this.get(Coords.get(x, y)!) ?? null;
      });
    });
  }

  /**
   * The board portion of an FEN string.
   */
  public toString(): string {
    return Array
      .from({ length: 8 }, (_, x) => {
        return Array
          .from({ length: 8 }, (_, y) => this.get(Coords.get(x, y)!)?.initial ?? Board.nullPiece)
          .join("")
          .replace(Board.nullPieceRegex, (zeros) => String(zeros.length));
      })
      .join("/");
  }

  public toReadableBoardString(): string {
    return Array
      .from({ length: 8 }, (_, x) => {
        return Array
          .from({ length: 8 }, (_, y) => this.get(Coords.get(x, y)!)?.initial ?? "-")
          .join(" ");
      })
      .join("\n");
  }
}