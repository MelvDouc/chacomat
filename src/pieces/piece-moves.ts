import { pawnOffsets, pieceOffsets } from "@chacomat/pieces/offsets.js";
import { PieceType } from "@chacomat/utils/constants.js";
import type {
  CoordsGenerator,
  Piece
} from "@chacomat/types.js";

// ===== ===== ===== ===== =====
// PAWN
// ===== ===== ===== ===== =====

function* pawnAttackedCoords(pawn: Piece): CoordsGenerator {
  for (const xOffset of pawnOffsets.x[pawn.color]) {
    for (const yOffset of pawnOffsets.y) {
      const coords = pawn.coords.getPeer(xOffset, yOffset);
      if (coords)
        yield coords;
    }
  }
}

function* forwardPawnMoves(pawn: Piece): CoordsGenerator {
  const coords1 = pawn.coords.getPeer(pawn.direction, 0)!;

  if (!pawn.board.has(coords1)) {
    yield coords1;

    if (pawn.coords.x === pawn.startRank) {
      const coords2 = coords1.getPeer(pawn.direction, 0)!;

      if (!pawn.board.has(coords2))
        yield coords2;
    }
  }
}

function* pawnCaptures(pawn: Piece): CoordsGenerator {
  for (const destCoords of pawn.attackedCoords())
    if (
      pawn.board.get(destCoords)?.color === pawn.oppositeColor
      || pawn.board.position.isEnPassantCapture(pawn.coords, destCoords)
    )
      yield destCoords;
}

// ===== ===== ===== ===== =====
// PIECES
// ===== ===== ===== ===== =====

function getShortPieceAttackedCoordsGenerator(pieceType: PieceType.KNIGHT | PieceType.KING): (piece: Piece) => CoordsGenerator {
  const { x: xOffsets, y: yOffsets } = pieceOffsets[pieceType];

  return function* (piece: Piece): CoordsGenerator {
    for (let i = 0; i < xOffsets.length; i++) {
      const destCoords = piece.coords.getPeer(xOffsets[i], yOffsets[i]);
      if (destCoords)
        yield destCoords;
    }
  };
}

function getLongPieceAttackedCoordsGenerator(pieceType: PieceType.ROOK | PieceType.BISHOP | PieceType.QUEEN): (piece: Piece) => CoordsGenerator {
  const { x: xOffsets, y: yOffsets } = pieceOffsets[pieceType];

  return function* (piece: Piece): CoordsGenerator {
    for (let i = 0; i < xOffsets.length; i++) {
      let coords = piece.coords.getPeer(xOffsets[i], yOffsets[i]);
      while (coords) {
        yield coords;
        if (piece.board.has(coords))
          break;
        coords = coords.getPeer(xOffsets[i], yOffsets[i]);
      }
    }
  };
}

// ===== ===== ===== ===== =====
// EXPORTS
// ===== ===== ===== ===== =====

export const attackedCoordsGenerators: Record<PieceType, (piece: Piece) => CoordsGenerator> = {
  [PieceType.PAWN]: pawnAttackedCoords,
  [PieceType.KNIGHT]: getShortPieceAttackedCoordsGenerator(PieceType.KNIGHT),
  [PieceType.KING]: getShortPieceAttackedCoordsGenerator(PieceType.KING),
  [PieceType.ROOK]: getLongPieceAttackedCoordsGenerator(PieceType.ROOK),
  [PieceType.BISHOP]: getLongPieceAttackedCoordsGenerator(PieceType.BISHOP),
  [PieceType.QUEEN]: getLongPieceAttackedCoordsGenerator(PieceType.QUEEN)
} as const;

export function* pseudoLegalPawnMoves(pawn: Piece): CoordsGenerator {
  yield* forwardPawnMoves(pawn);
  yield* pawnCaptures(pawn);
}