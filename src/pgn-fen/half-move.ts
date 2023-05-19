import Colors from "@src/constants/Colors.js";
import {
  Coords,
  coordsToNotation,
  fileNameToY,
  getCoords,
  rankNameToX
} from "@src/constants/Coords.js";
import Piece, { PieceInitials, PiecesByName } from "@src/constants/Piece.js";
import Position from "@src/game/Position.js";
import {
  AlgebraicNotation,
  Coordinates,
  HalfMoveWithPromotion,
  PieceInitial,
  PromotedPiece,
  Wing
} from "@src/types.js";

// ===== ===== ===== ===== =====
// TO MOVE ARRAY
// ===== ===== ===== ===== =====

const MOVE_FINDERS: Record<string, MoveFinder> = {
  PAWN_MOVE: {
    regex: /^(?<sf>[a-h])(x(?<df>[a-h]))?(?<dr>[1-8])(=?(?<pt>[QRBN]))?$/,
    getHalfMove: ({ legalMoves, activeColor, board }, { sf, df, dr, pt }) => {
      const srcY = fileNameToY(sf as string);
      const destCoords = (df)
        ? Coords[(df + dr) as AlgebraicNotation]
        : getCoords(8 - Number(dr), srcY);
      const move = legalMoves.find(([src, dest]) => {
        return (board.get(activeColor, src) as Piece) < Piece.KNIGHT
          && src.y === srcY
          && dest === destCoords;
      });

      if (move && pt)
        return [...move, PiecesByName[pt as PieceInitial] as PromotedPiece];
      return move;
    }
  },
  PIECE_MOVE: {
    regex: /^(?<pt>[KQRBN])(?<sf>[a-h])?(?<sr>[1-8])?x?(?<dc>[a-h][1-8])$/,
    getHalfMove: ({ legalMoves, board, activeColor }, { pt, sf, sr, dc }) => {
      const srcX = sr ? rankNameToX(sr) : null;
      const srcY = sf ? fileNameToY(sf) : null;
      const destCoords = Coords[dc as AlgebraicNotation];

      return legalMoves.find(([src, dest]) => {
        return dest === destCoords
          && board.get(activeColor, src) === PiecesByName[pt as PieceInitial]
          && (srcX === null || src.x === srcX)
          && (srcY === null || src.y === srcY);
      });
    }
  },
  CASTLING: {
    regex: /^(?<o>O|0)-\k<o>(?<o2>-\k<o>)?$/,
    getHalfMove: ({ board, legalMoves, activeColor }, { o2 }) => {
      const wing: Wing = (o2 !== undefined) ? -1 : 1;

      return legalMoves.find(([src, dest]) => {
        return board.get(activeColor, src) === Piece.KING
          && Math.sign(dest.y - src.y) === wing
          && Position.isCastling(src, dest, activeColor, board);
      });
    }
  }
} as const;

export function notationToHalfMove(notation: string, position: Position): HalfMoveWithPromotion | null {
  for (const key in MOVE_FINDERS) {
    const match = notation.match(MOVE_FINDERS[key].regex);

    if (match) {
      const halfMove = MOVE_FINDERS[key].getHalfMove(
        position,
        match.groups as Record<string, string>
      );

      if (halfMove)
        return halfMove;
    }
  }

  return null;
}

// ===== ===== ===== ===== =====
// TO NOTATION
// ===== ===== ===== ===== =====

export function halfMoveToNotation(
  position: Position,
  [srcCoords, destCoords, promotedPiece]: HalfMoveWithPromotion
): string {
  const srcPiece = position.board.get(position.activeColor, srcCoords) as Piece;

  if (srcPiece < Piece.KNIGHT)
    return halfPawnMoveToNotation(srcCoords, destCoords, promotedPiece);

  if (srcPiece === Piece.KING)
    return halfKingMoveToNotation(srcCoords, destCoords, position);

  const destNotation = coordsToNotation(destCoords);
  const isCapture = position.board.has(destCoords, position.inactiveColor);
  const { srcRank, srcFile } = getAmbiguousRankAndFile(srcCoords, destCoords, position);
  return PieceInitials[Colors.WHITE][srcPiece] + srcFile + srcRank + (isCapture ? "x" : "") + destNotation;
}


function halfPawnMoveToNotation(srcCoords: Coordinates, destCoords: Coordinates, promotedPiece?: PromotedPiece) {
  const destNotation = coordsToNotation(destCoords);
  const promotedPieceAbbrev = (promotedPiece) ? PieceInitials[Colors.WHITE][promotedPiece] : "";

  return (srcCoords.y !== destCoords.y)
    ? `${coordsToNotation(srcCoords)[0]}x${destNotation + promotedPieceAbbrev}`
    : destNotation + promotedPieceAbbrev;
}


function halfKingMoveToNotation(srcCoords: Coordinates, destCoords: Coordinates, { activeColor, inactiveColor, board }: Position) {
  const destNotation = coordsToNotation(destCoords);

  if (Position.isCastling(srcCoords, destCoords, activeColor, board))
    return (Math.sign(destCoords.y - srcCoords.y) === -1) ? "0-0-0" : "0-0";

  return `K${(board.has(destCoords, inactiveColor) ? "x" : "") + destNotation}`;
}


function getAmbiguousRankAndFile(srcCoords: Coordinates, destCoords: Coordinates, { board, activeColor, legalMoves }: Position): {
  srcFile: string;
  srcRank: string;
} {
  const similarMoves = legalMoves.filter(([src, dest]) => {
    return src !== srcCoords
      && dest === destCoords
      && board.get(activeColor, src) === board.get(activeColor, srcCoords);
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

// ===== ===== ===== ===== =====
// TYPES
// ===== ===== ===== ===== =====

interface MoveFinder {
  regex: RegExp;
  getHalfMove: (
    position: Position,
    groups: Record<string, string | undefined>,
  ) => HalfMoveWithPromotion | undefined;
}