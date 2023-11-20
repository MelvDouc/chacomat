import AbstractMove from "$src/moves/AbstractMove.ts";

export default class NullMove extends AbstractMove {
  public static readonly algebraicNotation = "--";
  public static readonly instance: NullMove = new this();

  private constructor() {
    super();
  }

  public override equals(move: AbstractMove): boolean {
    return move === this;
  }

  public override isCapture(): boolean {
    return false;
  }

  public override getAlgebraicNotation(): string {
    return NullMove.algebraicNotation;
  }

  public override play(): void { }

  public toJSON(): {
    srcIndex: number;
    destIndex: number;
  } {
    return {
      srcIndex: -1,
      destIndex: -1
    };
  }
}