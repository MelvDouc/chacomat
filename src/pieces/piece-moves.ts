import pieceOffsets from "@chacomat/pieces/offsets.js";
import type { IndexGenerator, Piece, PieceType } from "@chacomat/types.local.js";
import { coordsToIndex, isSafe } from "@chacomat/utils/Index.js";

// ===== ===== ===== ===== =====
// PAWN
// ===== ===== ===== ===== =====

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

function getShortPieceAttackedIndexGenerator(pieceType: "P" | "N" | "K") {
  const { x: xOffsets, y: yOffsets } = pieceOffsets[pieceType];

  return function* (piece: Piece): IndexGenerator {
    const { x, y } = piece.coords;
    const mult = (piece.isPawn()) ? piece.direction : 1;

    for (let i = 0; i < xOffsets.length; i++) {
      const x2 = x + xOffsets[i] * mult,
        y2 = y + yOffsets[i];
      if (isSafe(x2) && isSafe(y2))
        yield coordsToIndex(x2, y2);
    }
  };
}

function getLongPieceAttackedIndexGenerator(pieceType: "R" | "B" | "Q") {
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
  P: getShortPieceAttackedIndexGenerator("P"),
  N: getShortPieceAttackedIndexGenerator("N"),
  K: getShortPieceAttackedIndexGenerator("K"),
  R: getLongPieceAttackedIndexGenerator("R"),
  B: getLongPieceAttackedIndexGenerator("B"),
  Q: getLongPieceAttackedIndexGenerator("Q")
} as const;

export function* pseudoLegalPawnMoves(pawn: Piece): IndexGenerator {
  yield* forwardPawnMoves(pawn);
  yield* pawnCaptures(pawn);
}