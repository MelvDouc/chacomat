import { pointTable } from "$src/constants/SquareIndex.js";
import type Position from "$src/game/Position.js";

export function isInsufficientMaterial({ board, activeColor }: Position) {
  const { P, N, B, R, Q, p, n, b, r, q } = board.materialCount;

  if (P || R || Q || p || r || q)
    return false;

  const activeBishops = activeColor.isWhite() ? B : b;
  const activeKnights = activeColor.isWhite() ? N : n;
  const activeCount = (activeBishops ?? 0) + (activeKnights ?? 0);
  const inactiveBishops = !activeColor.isWhite() ? B : b;
  const inactiveKnights = !activeColor.isWhite() ? N : n;
  const inactiveCount = (inactiveBishops ?? 0) + (inactiveKnights ?? 0);

  if (activeCount === 0)
    return inactiveCount <= 1;

  if (activeCount > 1)
    return false;

  if (inactiveCount === 0)
    return true;

  if (inactiveCount > 1)
    return false;

  // check if same-colored bishops
  if (activeKnights || inactiveKnights)
    return false;

  const entries = board.getEntries();
  const [activeBishopIndex] = entries.find(([, piece]) => piece.isBishop() && piece.color === activeColor)!;
  const activePoint = pointTable[activeBishopIndex];
  const [inactiveBishopIndex] = entries.find(([, piece]) => piece.isBishop() && piece.color === activeColor.opposite)!;
  const inactivePoint = pointTable[inactiveBishopIndex];

  return (activePoint.x % 2 === activePoint.y % 2) === (inactivePoint.x % 2 === inactivePoint.y % 2);
}