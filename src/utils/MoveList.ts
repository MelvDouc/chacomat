import Color from "@/board/Color.ts";
import { ChacoMat } from "@/typings/chacomat.ts";

export default class MoveList {
  private static getHalfMoveString(positionBefore: ChacoMat.Position, positionAfter: ChacoMat.Position, useThreeDots: boolean) {
    let notation = positionAfter.srcMove!.fullAlgebraicNotation(positionBefore, positionAfter);

    if (positionBefore.comment)
      notation += ` { ${positionBefore.comment} }`;

    if (positionBefore.activeColor === Color.WHITE)
      return `${positionBefore.fullMoveNumber}.${notation}`;

    if (useThreeDots)
      return `${positionBefore.fullMoveNumber}...${notation}`;

    return notation;
  }

  public readonly position: ChacoMat.Position;
  public readonly moves: {
    readonly notation: string;
    moveList: MoveList;
  }[];

  public constructor(position: ChacoMat.Position) {
    this.position = position;
    this.moves = position.next.map((next, i) => {
      return {
        notation: MoveList.getHalfMoveString(position, next, i > 0 || (position.prev?.next.length ?? 0) > 1),
        moveList: new MoveList(next)
      };
    });
  }

  public toString() {
    if (this.moves.length === 0)
      return "";

    let str = this.moves[0].notation;

    for (let i = 1; i < this.moves.length; i++) {
      const next = this.moves[i].moveList.toString();
      str += next
        ? ` ( ${this.moves[i].notation} ${next} )`
        : ` ( ${this.moves[i].notation} )`;
    }

    const next = this.moves[0].moveList.toString();
    if (next) str += ` ${next}`;
    return str;
  }
}