import type Position from "$src/game/Position.js";
import type Move from "$src/moves/AbstractMove.js";
import type { NotationTree } from "$src/typings/types.js";

export default class PositionTree {
  protected static _notationTreeToMoveString(notationTree: NotationTree): string {
    const [mainLine, ...variations] = notationTree.next;
    if (!mainLine) return "";

    let notation = mainLine.notation;

    variations.forEach(({ notation: varNotation, tree }) => {
      const rest = this._notationTreeToMoveString(tree);
      rest && (varNotation += ` ${rest}`);
      notation += ` ( ${varNotation} )`;
    });

    const rest = this._notationTreeToMoveString(mainLine.tree);
    return rest ? `${notation} ${rest}` : notation;
  }

  public readonly position: Position;
  public prev: PositionTree | null;
  private readonly _next: {
    srcMove: Move;
    tree: PositionTree;
  }[] = [];

  public constructor(position: Position, prev: PositionTree | null = null) {
    this.position = position;
    this.prev = prev;
  }

  public hasMainLine() {
    return this._next.length > 0;
  }

  public get mainLine() {
    return this._next[0];
  }

  public hasVariations() {
    return this._next.length > 1;
  }

  public addNext(position: Position, srcMove: Move) {
    const nextTree = new PositionTree(position, this);
    this._next.push({ srcMove, tree: nextTree });
    return nextTree;
  }

  public clearNext() {
    this._next.length = 0;
  }

  public get root() {
    let tree: PositionTree = this;
    while (tree.prev)
      tree = tree.prev;
    return tree;
  }

  public get endOfVariation() {
    let tree: PositionTree = this;
    while (tree.hasMainLine())
      tree = tree.mainLine.tree;
    return tree;
  }

  public get notationTree() {
    return this._getNotationTree(!this.prev);
  }

  public toMoveString() {
    return PositionTree._notationTreeToMoveString(this.notationTree);
  }

  protected _getNotationTree(use3Dots: boolean) {
    const notationTree: NotationTree = {
      srcPosition: this.position,
      next: []
    };

    for (let i = 0; i < this._next.length; i++) {
      const { tree, srcMove } = this._next[i];
      let notation = srcMove.getFullAlgebraicNotation(this.position, tree.position);

      if (this.position.activeColor.isWhite())
        notation = `${this.position.fullMoveNumber}.${notation}`;
      else if (i > 0 || use3Dots)
        notation = `${this.position.fullMoveNumber}...${notation}`;

      if (i === 0 && this.position.comment)
        notation = `{ ${this.position.comment} } ${notation}`;

      notationTree.next.push({
        notation,
        tree: tree._getNotationTree(this.hasVariations() !== i > 0)
      });
    }

    return notationTree;
  }
}