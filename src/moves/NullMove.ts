import AbstractMove from "$src/moves/AbstractMove";

export default class NullMove extends AbstractMove {
  public static readonly algebraicNotation = "--";
  public static readonly instance = new this();

  private constructor() {
    super();
  }

  override equals(move: AbstractMove): boolean {
    return move === this;
  }

  isCapture() {
    return false;
  }

  getAlgebraicNotation() {
    return NullMove.algebraicNotation;
  }

  play() { }
}