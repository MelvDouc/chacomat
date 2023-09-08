import Color from "@/impl/Color.ts";
import { Position } from "@/types/types.ts";

export function getMoveSegments(
  { activeColor, board, fullMoveNumber, legalMoves, next }: Position,
  isFirst = true,
  acc: string[] = []
): string[] {
  if (!next.length) return acc;

  const [[move, position], ...variations] = next;
  const moveNo = (activeColor === Color.WHITE) ? `${position.fullMoveNumber}.`
    : (isFirst) ? `${position.fullMoveNumber - 1}...`
      : "";
  acc.push(moveNo + move.getAlgebraicNotation(board, legalMoves) + getCheckSign(position));

  variations.forEach(([move, position]) => {
    const moveNo = activeColor === Color.WHITE ? `${fullMoveNumber}.` : `${fullMoveNumber}...`;
    const notation = move.getAlgebraicNotation(board, legalMoves);
    acc.push("(", moveNo + notation + getCheckSign(position));
    getMoveSegments(position, false, acc);
    acc.push(")");
  });

  getMoveSegments(position, variations.length > 0, acc);
  return acc;
}

function getCheckSign(position: Position) {
  if (position.isCheckmate())
    return "#";
  if (position.isCheck())
    return "+";
  return "";
}