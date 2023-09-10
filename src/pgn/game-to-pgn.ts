import Color from "@/constants/Color.ts";
import type ShatranjPosition from "@/variants/shatranj/ShatranjPosition.ts";

export function stringifyPos(
  { activeColor, board, fullMoveNumber, legalMoves, next, comment }: ShatranjPosition,
  isFirst = true
): string {
  if (!next.length) return "";

  let acc = comment ? `{${comment}} ` : "";
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

function checkSign(position: ShatranjPosition) {
  if (position.isCheck())
    return position.legalMoves.length ? "+" : "#";
  return "";
}