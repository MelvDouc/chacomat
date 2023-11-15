import { MoveNode } from "$src/typings/types.ts";

export default class Line {
  private static stringifyMoveNode({ notation, moveNumber, isWhiteMove, comment, NAG }: MoveNode, useThreeDots: boolean) {
    if (NAG)
      notation += ` ${NAG}`;

    if (comment)
      notation += ` { ${comment} }`;

    if (isWhiteMove)
      return `${moveNumber}.${notation}`;

    if (useThreeDots)
      return `${Math.floor(moveNumber)}...${notation}`;

    return notation;
  }

  public comment?: string;
  public readonly moveNodes: MoveNode[] = [];

  public toString() {
    return this.toMoveText();
  }

  protected toMoveText(spaces = "") {
    let useThreeDots = true;
    let moveText = "";

    if (this.comment) {
      moveText = (spaces)
        ? `{ ${this.comment} } `
        : `{ ${this.comment} }\n`;
    }

    for (const moveNode of this.moveNodes) {
      moveText += `${Line.stringifyMoveNode(moveNode, useThreeDots)} `;

      if (!moveNode.variations) {
        useThreeDots = false;
        continue;
      }

      useThreeDots = true;
      moveNode.variations.forEach((variation) => {
        moveText += `\n${spaces + "  "}( ${(variation as Line).toMoveText(spaces + "  ")} )`;
      });
      moveText += `\n${spaces}`;
    }

    return moveText.slice(0, -1);
  }
}