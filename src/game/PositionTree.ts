import type Position from "$src/game/Position.js";

export default class PositionTree {
  public static fromPosition(pos: Position, use3Dots: boolean, acc: PositionTree[]): PositionTree[] {
    if (pos.next.length === 0)
      return acc;

    const [{ move, position: nextPos }, ...others] = pos.next;
    const notation = move.getFullAlgebraicNotation(pos, nextPos, use3Dots);
    const variations = others.length > 0
      ? others.map(({ move, position: nextPos }) => {
        const tree = new this(
          move.getFullAlgebraicNotation(pos, nextPos, true),
          nextPos,
          null
        );
        return this.fromPosition(nextPos, false, [tree]);
      })
      : null;

    acc.push(new this(notation, pos, variations));
    return this.fromPosition(nextPos, variations !== null, acc);
  }


  public static stringify(trees: PositionTree[]) {
    return trees
      .map(({ notation, variations }) => {
        variations?.forEach((v) => notation += ` ( ${this.stringify(v)} )`);
        return notation;
      })
      .join(" ");
  }


  public constructor(
    public readonly notation: string,
    public readonly position: Position,
    public readonly variations: PositionTree[][] | null
  ) { }
}