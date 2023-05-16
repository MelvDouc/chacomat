import { Coordinates, Coords, coordsToNotation, File, getCoords } from "@src/constants/Coords.js";
import Piece, { PieceAbbreviations, PiecesByName, PromotedPiece } from "@src/constants/Piece.js";
import Position from "@src/game/Position.js";
import {
  AlgebraicNotation,
  HalfMove,
  HalfMoveWithPromotion,
  PieceMap,
  Wing
} from "@src/types.js";

const MOVE_FINDERS: Record<string, MoveFinder> = {
  PAWN_MOVE: {
    regex: /^(?<sf>[a-h])(x(?<df>[a-h]))?(?<dr>[1-8])(=?(?<pt>[QRNB]))?$/,
    getHalfMove: ({ sf, df, dr, pt }, halfMoves, pieceMap) => {
      const srcY = File[sf as keyof typeof File];
      const destCoords = (df)
        ? Coords[(df + dr) as AlgebraicNotation]
        : getCoords(8 - Number(dr), srcY);
      const move = halfMoves.find(([src, dest]) => {
        return (pieceMap.get(src) as Piece) < Piece.KNIGHT
          && src.y === srcY
          && dest === destCoords;
      });

      if (move && pt)
        return [...move, PiecesByName[pt as keyof typeof PiecesByName] as PromotedPiece];
      return move;
    }
  },
  PIECE_MOVE: {
    regex: /^(?<pt>[KQRBN])(?<sf>[a-h])?(?<sr>[1-8])?x?(?<df>[a-h])(?<dr>[1-8])$/,
    getHalfMove: ({ pt, sf, sr, df, dr }, halfMoves, pieceMap) => {
      const srcX = (sr) ? (8 - +sr) : null;
      const srcY = (sf) ? File[sf as keyof typeof File] : null;
      const destCoords = Coords[((df as string) + (dr as string)) as AlgebraicNotation];

      return halfMoves.find(([src, dest]) => {
        return dest === destCoords
          && pieceMap.get(src) === PiecesByName[pt as keyof typeof PiecesByName]
          && (srcX === null || src.x === srcX)
          && (srcY === null || src.y === srcY);
      });
    }
  },
  CASTLING: {
    regex: /^(?<o>O|0)-\k<o>(?<o2>-\k<o>)?$/,
    getHalfMove: ({ o2 }, halfMoves, pieceMap) => {
      const wing: Wing = (o2 !== undefined) ? -1 : 1;
      return halfMoves.find(([src, dest]) => {
        return pieceMap.get(src) === Piece.KING
          && Math.sign(dest.y - src.y) === wing
          && (Math.abs(dest.y - src.y) === 2 || pieceMap.get(dest) === Piece.ROOK);
      });
    }
  }
} as const;

export default function getHalfMove(halfMoveStr: string, position: Position): HalfMoveWithPromotion | null {
  for (const key in MOVE_FINDERS) {
    const match = halfMoveStr.match(MOVE_FINDERS[key].regex);

    if (match) {
      const halfMove = MOVE_FINDERS[key].getHalfMove(
        match.groups as Record<string, string>,
        position.legalMoves,
        position.pieces[position.activeColor]
      );

      if (halfMove)
        return halfMove;
    }
  }

  return null;
}

export function halfMoveToNotation(
  { pieces, activeColor, inactiveColor, legalMoves }: Position,
  [srcCoords, destCoords, promotedPiece]: HalfMoveWithPromotion
): string {
  const srcPiece = pieces[activeColor].get(srcCoords) as Piece;
  const destNotation = coordsToNotation(destCoords);

  if (srcPiece < Piece.KNIGHT) {
    const promotedPieceAbbrev = (promotedPiece) ? PieceAbbreviations[promotedPiece] : "";
    return (srcCoords.y !== destCoords.y)
      ? `${coordsToNotation(srcCoords)[0]}x${destNotation + promotedPieceAbbrev}`
      : destNotation + promotedPieceAbbrev;
  }

  const captureMarker = pieces[inactiveColor].has(destCoords) ? "x" : "";

  if (srcPiece === Piece.KING) {
    if (Math.abs(destCoords.y - srcCoords.y) === 2 || pieces[activeColor].get(destCoords) === Piece.ROOK)
      return (Math.sign(destCoords.y - srcCoords.y) === -1) ? "0-0-0" : "0-0";
    return `K${captureMarker + destNotation}`;
  }

  const { srcRank, srcFile } = getAmbiguousRankAndFile(legalMoves, srcCoords, destCoords, pieces[activeColor]);
  return PieceAbbreviations[srcPiece] + srcFile + srcRank + captureMarker + destNotation;
}

function getAmbiguousRankAndFile(legalMoves: HalfMove[], srcCoords: Coordinates, destCoords: Coordinates, pieceMap: PieceMap): {
  srcFile: string;
  srcRank: string;
} {
  const similarMoves = legalMoves.filter(([src, dest]) => {
    return src !== srcCoords
      && dest === destCoords
      && pieceMap.get(src) === pieceMap.get(srcCoords);
  });

  if (!similarMoves.length)
    return { srcRank: "", srcFile: "" };

  const [srcFileNotation, srcRankNotation] = coordsToNotation(srcCoords);

  if (similarMoves.every(([src]) => src.y !== srcCoords.y))
    return { srcFile: srcFileNotation, srcRank: "" };

  if (similarMoves.every(([src]) => src.x !== srcCoords.x))
    return { srcFile: "", srcRank: srcRankNotation };

  return { srcFile: srcFileNotation, srcRank: srcRankNotation };
}


interface MoveFinder {
  regex: RegExp;
  getHalfMove: (groups: Record<string, string | undefined>, halfMoves: HalfMove[], pieceMap: PieceMap) => HalfMoveWithPromotion | undefined;
}