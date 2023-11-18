import { Position } from "$src/typings/types";

export default class MoveTree {
  public readonly position: Position;
  public readonly comment: string | null;
  public readonly nodes: {
    notation: string;
    NAG?: string;
    comment?: string;
    next: MoveTree;
  }[];

  public constructor(position: Position) {
    this.position = position;
    this.comment = position.comment ?? null;

    this.nodes = [...position.next()].map((nextPos) => {
      const srcMove = nextPos.srcMove!;
      return {
        notation: srcMove.getAlgebraicNotation(position),
        NAG: srcMove.NAG,
        comment: srcMove.comment,
        next: new MoveTree(nextPos)
      };
    });
  }

  toMoveString() {
    let moveString = "";

    if (this.comment) {
      moveString = `{ ${this.comment} }`;
    }

    const [firstNode, ...otherNodes] = this.nodes;

    if (firstNode) {
      moveString += ` ${firstNode.notation}`;
    }
  }
}