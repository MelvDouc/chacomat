import { Coords, getCoords } from "@src/constants/Coords.js";
import Piece, { PiecesByName, PromotedPiece } from "@src/constants/Piece.js";
import Position from "@src/game/Position.js";
import { Wing, HalfMove, HalfMoveWithPromotion, PieceMap, AlgebraicNotation } from "@src/types.js";

const MOVE_FINDERS: Record<string, MoveFinder> = {
  PAWN_MOVE: {
    regex: /^(?<sf>[a-h])(x(?<df>[a-h]))?(?<dr>[1-8])(=?(?<pt>[QRNB]))?$/,
    getHalfMove: ({ sf, df, dr, pt }, halfMoves, pieceMap) => {
      const srcY = sf.charCodeAt(0) - 97;
      const destCoords = (df)
        ? Coords[(df + dr) as AlgebraicNotation]
        : getCoords(8 - +dr, srcY);
      const move = halfMoves.find(([src, dest]) => {
        return pieceMap.get(src) < Piece.KNIGHT
          && src.y === srcY
          && dest === destCoords;
      });

      if (move)
        return (pt)
          ? [...move, PiecesByName[pt as keyof typeof PiecesByName] as PromotedPiece]
          : move;
      return null;
    }
  },
  PIECE_MOVE: {
    regex: /^(?<pt>[KQRBN])(?<sf>[a-h])?(?<sr>[1-8])?x?(?<df>[a-h])(?<dr>[1-8])$/,
    getHalfMove: ({ pt, sf, sr, df, dr }, halfMoves, pieceMap) => {
      const srcX = (sr) ? (8 - +sr) : null;
      const srcY = (sf) ? (sf.charCodeAt(0) - 97) : null;
      const destCoords = Coords[(df + dr) as AlgebraicNotation];

      return halfMoves.find(([src, dest]) => {
        return dest === destCoords
          && pieceMap.get(src) === PiecesByName[pt as keyof typeof PiecesByName]
          && (srcX === null || src.x === srcX)
          && (srcY === null || src.y === srcY);
      }) ?? null;
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
      }) ?? null;
    }
  }
} as const;

export default function getHalfMove(halfMoveStr: string, position: Position): HalfMoveWithPromotion | null {
  for (const key in MOVE_FINDERS) {
    const match = halfMoveStr.match(MOVE_FINDERS[key].regex);

    if (match) {
      const halfMove = MOVE_FINDERS[key].getHalfMove(
        match.groups,
        position.getHalfMoves(),
        position.pieces[position.activeColor]
      );

      if (halfMove)
        return halfMove;
    }
  }

  return null;
}


interface MoveFinder {
  regex: RegExp;
  getHalfMove: (groups: Record<string, string | undefined>, halfMoves: HalfMove[], pieceMap: PieceMap) => HalfMoveWithPromotion | null;
}