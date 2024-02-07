import type Position from "$src/game/Position.js";

export function getTree(position: Position, use3Dots: boolean, acc: PositionTree): PositionTree {
  if (position.next.length === 0)
    return acc;

  const [{ move, position: nextPos }, ...others] = position.next;
  const notation = move.getFullAlgebraicNotation(position, nextPos, use3Dots);
  const variations = others.length > 0
    ? others.map(({ move, position: nextPos }) => {
      const firstNode = {
        notation: move.getFullAlgebraicNotation(position, nextPos, true),
        position: nextPos,
        variations: null
      };
      return getTree(nextPos, false, [firstNode]);
    })
    : null;

  acc.push({ notation, position, variations });
  return getTree(nextPos, variations !== null, acc);
}

export function stringify(trees: PositionTree) {
  return trees
    .map(({ notation, variations }) => {
      variations?.forEach((v) => notation += ` ( ${stringify(v)} )`);
      return notation;
    })
    .join(" ");
}

export type PositionTree = {
  readonly notation: string;
  readonly position: Position;
  readonly variations: PositionTree[] | null;
}[];