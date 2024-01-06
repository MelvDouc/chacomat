import type Board from "$src/game/Board.js";
import type Position from "$src/game/Position.js";
import globalConfig from "$src/global-config.js";

export default abstract class AbstractMove {
  public NAG?: string;
  public commentBefore?: string;
  public commentAfter?: string;

  public abstract isCapture(): boolean;
  public abstract getAlgebraicNotation(position: Position): string;
  public abstract equals(move: AbstractMove): boolean;
  public abstract play(board: Board): void;

  public getFullAlgebraicNotation(positionBefore: Position, positionAfter: Position, use3Dots?: boolean) {
    const checkSign: string = positionAfter.isCheckmate() ? globalConfig.checkmateSign
      : positionAfter.isCheck() ? "+"
        : "";
    let notation = this.getAlgebraicNotation(positionBefore) + checkSign;

    if (positionBefore.activeColor.isWhite())
      notation = `${positionBefore.fullMoveNumber}.${notation}`;
    else if (use3Dots)
      notation = `${positionBefore.fullMoveNumber}...${notation}`;

    if (this.commentBefore)
      notation = `{ ${this.commentBefore} } ${notation}`;

    if (this.NAG)
      notation += ` ${this.NAG}`;

    if (this.commentAfter)
      notation += ` { ${this.commentAfter} }`;

    return notation;
  }
}