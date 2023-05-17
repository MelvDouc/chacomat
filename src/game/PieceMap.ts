import Colors from "@src/constants/Colors.js";
import { getCoords } from "@src/constants/Coords.js";
import Piece, { PieceAbbreviations, PiecesByName } from "@src/constants/Piece.js";
import Position from "@src/game/Position.js";
import { Coordinates } from "@src/types.js";


export default class PieceMap extends Map<Coordinates, Piece> {
  public static parseBoard(pieceStr: string): Position["pieces"] {
    return pieceStr
      .split("/")
      .reduce((acc, row, x) => {
        row
          .replace(/\d+/g, (n) => "0".repeat(+n))
          .split("")
          .forEach((char, y) => {
            if (char !== "0")
              acc[(char === char.toUpperCase()) ? Colors.WHITE : Colors.BLACK].set(
                getCoords(x, y),
                PiecesByName[char as keyof typeof PiecesByName]
              );
          });
        return acc;
      }, {
        [Colors.WHITE]: new PieceMap(),
        [Colors.BLACK]: new PieceMap()
      });
  }

  public static stringifyBoard(board: Position["pieces"]): string {
    return Array
      .from({ length: 8 }, (_, x) => {
        return Array
          .from({ length: 8 }, (_, y) => {
            const coords = getCoords(x, y);

            if (board[Colors.WHITE].has(coords))
              return PieceAbbreviations[board[Colors.WHITE].get(coords) as Piece];

            if (board[Colors.BLACK].has(coords))
              return PieceAbbreviations[board[Colors.BLACK].get(coords) as Piece].toLowerCase();

            return "0";
          })
          .join("")
          .replace(/0+/g, (zeros) => String(zeros.length));
      })
      .join("/");
  }

  public kingCoords: Coordinates;

  public override set(key: Coordinates, value: Piece): this {
    if (value === Piece.KING)
      this.kingCoords = key;

    return super.set(key, value);
  }

  public clone(): PieceMap {
    const clone = new PieceMap([...this]);
    clone.kingCoords = this.kingCoords;
    return clone;
  }
}