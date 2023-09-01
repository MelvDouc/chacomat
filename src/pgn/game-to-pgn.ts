import Color from "@constants/Color.js";
import type Position from "@game/Position.js";
import { GameMetaData } from "@types.js";

export function stringifyMetaData(metaData: Partial<GameMetaData>): string {
  return Object.entries(metaData).map(([key, value]) => `[${key} "${value}"]`).join("\n");
}

export function getMoveSegments({ activeColor, board, fullMoveNumber, legalMoves, next }: Position, afterVar = false): string[] {
  if (!next.length) return [];

  const segments: string[] = [];
  const [{ move, position }, ...variations] = next;

  if (activeColor === Color.WHITE)
    segments.push(`${position.fullMoveNumber}.`);
  else if (afterVar)
    segments.push(`${position.fullMoveNumber - 1}...`);

  segments.push(move.getAlgebraicNotation(board, legalMoves));

  variations.forEach(({ move, position }) => {
    const moveNo = activeColor === Color.WHITE ? `${fullMoveNumber}.` : `${fullMoveNumber}...`;
    const notation = move.getAlgebraicNotation(board, legalMoves);
    segments.push("(", moveNo, notation, ...getMoveSegments(position), ")");
  });

  segments.push(...getMoveSegments(position, variations.length > 0));
  return segments;
}