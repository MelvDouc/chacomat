import AbstractMove from "$src/moves/AbstractMove.js";

export default class NullMove extends AbstractMove {
  public static readonly algebraicNotation = "--";
  public static readonly instance: NullMove = new this();

  private constructor() {
    super();
  }

  public override equals(move: AbstractMove): boolean {
    return move === this;
  }

  public override isCapture() {
    return false;
  }

  public override getAlgebraicNotation() {
    return NullMove.algebraicNotation;
  }

  public override play() { }
}