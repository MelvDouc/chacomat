import Colors from "@src/constants/Colors.js";
import { File, getCoords } from "@src/constants/Coords.js";
import Piece, { PieceAbbreviations, PiecesByName } from "@src/constants/Piece.js";
import PieceMap from "@src/game/PieceMap.js";
import { CastlingRights, PositionInfo } from "@src/types.js";

const fenRegex = /^[1-8PNBRQKpnbrqk]{1,8}(\/[1-8PNBRQKpnbrqk]{1,8}){7} (w|b) (?!.*(.).*\1)([KQkq]{1,4}|[a-hA-H]{1,4}|-) ([a-h][1-8]|-) \d+ \d+$/;

// ===== ===== ===== ===== =====
// PARSE
// ===== ===== ===== ===== =====

export function getPieceMaps(pieceStr: string): PositionInfo["pieces"] {
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

export function getCastlingRights(castlingStr: string): CastlingRights {
  const castlingRights: CastlingRights = {
    [Colors.WHITE]: new Set(),
    [Colors.BLACK]: new Set()
  };

  if (castlingStr === "-")
    return castlingRights;

  if (/[a-hA-H]/.test(castlingStr)) {
    for (const char of castlingStr) {
      if (char === char.toUpperCase())
        castlingRights[Colors.WHITE].add(File[char.toLowerCase() as keyof typeof File]);
      else
        castlingRights[Colors.BLACK].add(File[char as keyof typeof File]);
    }

    return castlingRights;
  }

  if (castlingStr.includes("K"))
    castlingRights[Colors.WHITE].add(0);
  if (castlingStr.includes("Q"))
    castlingRights[Colors.WHITE].add(7);
  if (castlingStr.includes("k"))
    castlingRights[Colors.BLACK].add(0);
  if (castlingStr.includes("q"))
    castlingRights[Colors.BLACK].add(7);

  return castlingRights;
}

// ===== ===== ===== ===== =====
// STRINGIFY
// ===== ===== ===== ===== =====

export function stringifyBoard(pieces: PositionInfo["pieces"]): string {
  let boardStr = "";

  for (let x = 0; x < 8; x++) {
    let row = "";

    for (let y = 0; y < 8; y++) {
      const coords = getCoords(x, y);

      if (pieces[Colors.WHITE].has(coords)) {
        row += PieceAbbreviations[pieces[Colors.WHITE].get(coords) as Piece];
        continue;
      }

      if (pieces[Colors.BLACK].has(coords)) {
        row += PieceAbbreviations[pieces[Colors.BLACK].get(coords) as Piece].toLowerCase();
        continue;
      }

      row += "0";
    }

    boardStr += row.replace(/0+/g, (zeros) => String(zeros.length));
    if (x !== 8 - 1)
      boardStr += "/";
  }

  return boardStr;
}

export function stringifyCastlingRights(castlingRights: CastlingRights, isChess960: boolean): string {
  if (isChess960)
    return stringifyChess960CastlingRights(castlingRights);

  let result = "";

  if (castlingRights[Colors.WHITE].has(0))
    result += "K";
  if (castlingRights[Colors.WHITE].has(7))
    result += "Q";
  if (castlingRights[Colors.BLACK].has(0))
    result += "k";
  if (castlingRights[Colors.BLACK].has(7))
    result += "q";

  return result || "-";
}

function stringifyChess960CastlingRights(castlingRights: CastlingRights): string {
  let result = "";

  castlingRights[Colors.WHITE].forEach((y) => result += File[y].toUpperCase());
  castlingRights[Colors.BLACK].forEach((y) => result += File[y]);

  return result || "-";
}

// ===== ===== ===== ===== =====
// VALIDATE
// ===== ===== ===== ===== =====

export function isValidFen(fen: string): boolean {
  return fenRegex.test(fen);
}