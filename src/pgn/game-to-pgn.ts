import Color from "@/game/Color.ts";
import { Position } from "@/types/main-types.ts";

export function stringifyPos(
  { activeColor, board, fullMoveNumber, legalMoves, next }: Position,
  isFirst = true
): string {
  if (!next.length) return "";

  let acc = "";
  const [[move0, nextPos0], ...variations] = next;

  if (activeColor === Color.WHITE)
    acc += `${fullMoveNumber}.`;
  else if (isFirst)
    acc += `${fullMoveNumber}...`;

  acc += move0.getAlgebraicNotation(board, legalMoves) + checkSign(nextPos0);

  variations.forEach(([moveN, nextPosN]) => {
    acc += (activeColor === Color.WHITE)
      ? ` ( ${fullMoveNumber}.`
      : ` ( ${fullMoveNumber}...`;
    acc += `${moveN.getAlgebraicNotation(board, legalMoves) + checkSign(nextPosN)} ${stringifyPos(nextPosN, false)})`;
  });

  return `${acc} ${stringifyPos(nextPos0, variations.length > 0)}`;
}

function checkSign(position: Position) {
  if (position.isCheck())
    return position.legalMoves.length ? "+" : "#";
  return "";
}