import { Position } from "$src/typings/types.ts";
import Colors from "$src/constants/Colors.ts";
import { pointTable } from "$src/constants/SquareIndex.ts";

export function isInsufficientMaterial({ board, activeColor, inactiveColor }: Position) {
  const { P, N, B, R, Q, p, n, b, r, q } = board.materialCount;

  if (P || R || Q || p || r || q)
    return false;

  const activeBishops = activeColor === Colors.WHITE ? B : b;
  const activeKnights = activeColor === Colors.WHITE ? N : n;
  const activeCount = (activeBishops ?? 0) + (activeKnights ?? 0);
  const inactiveBishops = activeColor === Colors.BLACK ? B : b;
  const inactiveKnights = activeColor === Colors.BLACK ? N : n;
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

  const [activeBishopIndex] = board.getPieces().find(([, piece]) => piece.isBishop() && piece.color === activeColor)!;
  const activePoint = pointTable[activeBishopIndex];
  const [inactiveBishopIndex] = board.getPieces().find(([, piece]) => piece.isBishop() && piece.color === inactiveColor)!;
  const inactivePoint = pointTable[inactiveBishopIndex];

  return (activePoint.x % 2 === activePoint.y % 2) === (inactivePoint.x % 2 === inactivePoint.y % 2);
}