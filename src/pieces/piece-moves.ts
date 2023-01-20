import { pawnOffsets, pieceOffsets } from "@chacomat/pieces/offsets.js";
import type {
  IndexGenerator,
  Piece
} from "@chacomat/types.js";
import { PieceType } from "@chacomat/utils/constants.js";
import { coordsToIndex, isSafe } from "@chacomat/utils/Index.js";

// ===== ===== ===== ===== =====
// PAWN
// ===== ===== ===== ===== =====

function* pawnAttackedCoords(pawn: Piece): IndexGenerator {
  const { x, y } = pawn.coords;

  for (const xOffset of pawnOffsets.x[pawn.color]) {
    for (const yOffset of pawnOffsets.y) {
      const x2 = x + xOffset,
        y2 = y + yOffset;
      if (isSafe(x2) && isSafe(y2))
        yield coordsToIndex(x2, y2);
    }
  }
}

function* forwardPawnMoves(pawn: Piece): IndexGenerator {
  const { x, y } = pawn.coords;
  const index1 = coordsToIndex(x + pawn.direction, y);

  if (!pawn.board.has(index1)) {
    yield index1;

    if (x === pawn.startRank) {
      const index2 = coordsToIndex(x + pawn.direction * 2, y);

      if (!pawn.board.has(index2))
        yield index2;
    }
  }
}

function* pawnCaptures(pawn: Piece): IndexGenerator {
  for (const destIndex of pawn.attackedIndices())
    if (
      pawn.board.get(destIndex)?.color === pawn.oppositeColor
      || pawn.board.position.isEnPassantCapture(pawn.index, destIndex)
    )
      yield destIndex;
}

// ===== ===== ===== ===== =====
// PIECES
// ===== ===== ===== ===== =====

function getShortPieceAttackedIndexGenerator(pieceType: PieceType.KNIGHT | PieceType.KING) {
  const { x: xOffsets, y: yOffsets } = pieceOffsets[pieceType];

  return function* (piece: Piece): IndexGenerator {
    const { x, y } = piece.coords;

    for (let i = 0; i < xOffsets.length; i++) {
      const x2 = x + xOffsets[i],
        y2 = y + yOffsets[i];
      if (isSafe(x2) && isSafe(y2))
        yield coordsToIndex(x2, y2);
    }
  };
}

function getLongPieceAttackedIndexGenerator(pieceType: PieceType.ROOK | PieceType.BISHOP | PieceType.QUEEN) {
  const { x: xOffsets, y: yOffsets } = pieceOffsets[pieceType];

  return function* (piece: Piece): IndexGenerator {
    const { x, y } = piece.coords;

    for (let i = 0; i < xOffsets.length; i++) {
      let x2 = x, y2 = y;
      while (isSafe(x2 += xOffsets[i]) && isSafe(y2 += yOffsets[i])) {
        const index = coordsToIndex(x2, y2);
        yield index;
        if (piece.board.has(index))
          break;
      }
    }
  };
}

// ===== ===== ===== ===== =====
// EXPORTS
// ===== ===== ===== ===== =====

export const attackedIndexGenerators: Record<PieceType, (piece: Piece) => IndexGenerator> = {
  [PieceType.PAWN]: pawnAttackedCoords,
  [PieceType.KNIGHT]: getShortPieceAttackedIndexGenerator(PieceType.KNIGHT),
  [PieceType.KING]: getShortPieceAttackedIndexGenerator(PieceType.KING),
  [PieceType.ROOK]: getLongPieceAttackedIndexGenerator(PieceType.ROOK),
  [PieceType.BISHOP]: getLongPieceAttackedIndexGenerator(PieceType.BISHOP),
  [PieceType.QUEEN]: getLongPieceAttackedIndexGenerator(PieceType.QUEEN)
} as const;

export function* pseudoLegalPawnMoves(pawn: Piece): IndexGenerator {
  yield* forwardPawnMoves(pawn);
  yield* pawnCaptures(pawn);
}