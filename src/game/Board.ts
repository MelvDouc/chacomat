import Color from "../constants/Color.js";
import Piece from "../pieces/Piece.js";
import type { AttackedCoordsRecord, Coords, PieceInitial } from "../types.js";

/**
 * @classdesc A representation of the board with only keeps track of the squares occupied by pieces and the pieces themselves.
 */
export default class Board extends Array<Array<Piece | null>> {
  static #nullPiece = "0";
  static #nullPieceRegex = /0+/g;

  /**
   * @param {string} pieceString The portion of an FEN string representing the board.
   * @returns A new instance of `PieceMap`.
   */
  static fromPieceString(pieceString: string): Board {
    const board = pieceString.split("/").reduce((acc, row) => {
      acc.push(
        row
          .replace(/\d+/g, (num) => Board.#nullPiece.repeat(+num))
          .split("")
          .map((char) => {
            return (char !== Board.#nullPiece)
              ? Piece.fromInitial(char as PieceInitial)
              : null;
          }),
      );
      return acc;
    }, new Board());

    for (let x = 0; x < 8; x++)
      for (let y = 0; y < 8; y++)
        if (board[x][y]?.type === Piece.Types.KING)
          board.kingCoords[board[x][y]!.color] = { x, y };

    return board;
  }

  /**
   * A convenient way to keep of each king's position.
   */
  readonly kingCoords = {
    [Color.WHITE]: { x: -1, y: -1 },
    [Color.BLACK]: { x: -1, y: -1 }
  };

  /**
   * How many pieces are on the board.
   */
  get pieceCount(): number {
    return this.reduce(
      (acc, row) => acc + row.filter((item) => item !== null).length,
      0,
    );
  }

  /**
   * The coords attacked by the given color.
   * Used in determining if a position is check and which castling moves are actually legal.
   * This will be calculated only once for performance.
   */
  getAttackedCoords(color: Color): AttackedCoordsRecord {
    const result = {} as AttackedCoordsRecord;

    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        if (this[x][y]?.color === color) {
          for (const coords of this[x][y]!.attackedCoords({ x, y }, this)) {
            result[coords.x] ??= {};
            result[coords.x][coords.y] = true;
          }
        }
      }
    }

    return result;
  }

  /**
   * Clones this instance and every piece it contains.
   */
  clone(): Board {
    const clone = new Board();
    clone.push(
      ...this.map((row) => {
        return row.map((item) => item ? item.clone() : null);
      })
    );
    clone.kingCoords[Color.WHITE] = this.kingCoords[Color.WHITE];
    clone.kingCoords[Color.BLACK] = this.kingCoords[Color.BLACK];
    return clone;
  }

  asBoardString(): string {
    return this
      .map((row) => {
        return row.map((item) => item?.initial ?? "-").join(" ");
      })
      .join("\n");
  }

  /**
   * The board portion of an FEN string.
   */
  toString(): string {
    return Array.from({ length: 8 }, (_, x) => {
      let row = "";
      for (let y = 0; y < 8; y++)
        row += this[x][y]?.initial ?? Board.#nullPiece;
      return row.replace(
        Board.#nullPieceRegex,
        (zeros) => String(zeros.length),
      );
    }).join("/");
  }
}
