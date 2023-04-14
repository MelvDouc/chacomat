import Colors, { Color } from "@src/constants/Colors.js";
import { Coords, Coordinates, getCoords } from "@src/constants/Coords.js";
import Piece, { PiecesByName, PieceAbbreviations } from "@src/constants/Piece.js";
import { AlgebraicNotation, CastlingRights, PositionInfo } from "@src/types.js";

const fenRegex = /^[1-8PNBRQKpnbrqk]{1,8}(\/[1-8PNBRQKpnbrqk]{1,8}){7} (w|b) (?!.*(.).*\1)([KQkq]{1,4}|[a-hA-H]{1,4}|-) ([a-h][1-8]|-) \d+ \d+$/;

// ===== ===== ===== ===== =====
// PARSE
// ===== ===== ===== ===== =====

export function parseFen(fen: string): PositionInfo {
  if (!fenRegex.test(fen))
    throw new Error(`Invalid FEN string: "${fen}"`);

  const [pieceStr, color, castlingStr, enPassant, halfMoveClock, fullMoveNumber] = fen.split(" ");

  return {
    ...getPieceMaps(pieceStr),
    activeColor: (color === "w") ? Colors.WHITE : Colors.BLACK,
    castlingRights: getCastlingRights(castlingStr),
    enPassantCoords: Coords[enPassant as AlgebraicNotation] ?? null,
    halfMoveClock: +halfMoveClock,
    fullMoveNumber: +fullMoveNumber
  };
}

function getPieceMaps(pieceStr: string): {
  pieces: PositionInfo["pieces"];
  kingCoords: PositionInfo["kingCoords"];
} {
  const pieces = {
    [Colors.WHITE]: new Map<Coordinates, Piece>(),
    [Colors.BLACK]: new Map<Coordinates, Piece>()
  };
  const kingCoords = {} as Record<Color, Coordinates>;

  pieceStr
    .split("/")
    .forEach((row, x) => {
      row
        .replace(/\d+/g, (n) => "0".repeat(+n))
        .split("")
        .forEach((char, y) => {
          if (char === "0")
            return;

          const coords = getCoords(x, y);
          const piece = PiecesByName[char as keyof typeof PiecesByName];
          const color = (char === char.toUpperCase()) ? Colors.WHITE : Colors.BLACK;
          pieces[color].set(coords, piece);
          if (piece === Piece.KING)
            kingCoords[color] = coords;
        });
    });

  return { pieces, kingCoords };
}

function getCastlingRights(str: string): CastlingRights {
  const castlingRights: CastlingRights = {
    [Colors.WHITE]: new Set(),
    [Colors.BLACK]: new Set()
  };

  if (str === "-")
    return castlingRights;

  if (str.includes("K"))
    castlingRights[Colors.WHITE].add(0);
  if (str.includes("Q"))
    castlingRights[Colors.WHITE].add(7);
  if (str.includes("k"))
    castlingRights[Colors.BLACK].add(0);
  if (str.includes("q"))
    castlingRights[Colors.BLACK].add(7);

  return castlingRights;
}

// ===== ===== ===== ===== =====
// STRINGIFY
// ===== ===== ===== ===== =====

export function stringifyBoard(pieces: PositionInfo["pieces"]): string {
  return Array.from({ length: 8 }, (_, x) => {
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

    return row.replace(/0+/g, (zeros) => String(zeros.length));
  }).join("/");
}

export function stringifyCastlingRights(castlingRights: CastlingRights): string {
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