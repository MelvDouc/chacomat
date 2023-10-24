import Color from "@/board/Color.ts";
import { ChacoMat } from "@/typings/chacomat.ts";

function getNotation(positionBefore: ChacoMat.Position, positionAfter: ChacoMat.Position, useThreeDots: boolean) {
  let notation = positionAfter.srcMove!.fullAlgebraicNotation(positionBefore, positionAfter);

  if (positionBefore.comment)
    notation += ` { ${positionBefore.comment} }`;

  if (positionBefore.activeColor === Color.WHITE)
    return `${positionBefore.fullMoveNumber}.${notation}`;

  if (useThreeDots)
    return `${positionBefore.fullMoveNumber}...${notation}`;

  return notation;
}

export function getMoveTree(position: ChacoMat.Position, useThreeDots = false): ChacoMat.MoveTree | null {
  if (position.next.length === 0)
    return null;

  const [mainLine, ...variations] = position.next;
  const tree: ChacoMat.MoveTree = {
    position: mainLine,
    notation: getNotation(position, mainLine, useThreeDots),
    next: getMoveTree(mainLine, variations.length > 0)
  };

  if (variations.length > 0) {
    tree.variations = variations.map((variation) => ({
      position: variation,
      notation: getNotation(position, variation, true),
      next: getMoveTree(variation)
    }));
  }

  return tree;
}

export function stringifyMoveTree({ notation, variations, next }: ChacoMat.MoveTree): string {
  let str = notation;

  if (variations)
    for (const variation of variations)
      str += ` ( ${stringifyMoveTree(variation)} )`;

  if (next) str += ` ${stringifyMoveTree(next)}`;
  return str;
}