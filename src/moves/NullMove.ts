import Move from "$src/moves/Move.js";

export default class NullMove extends Move {
  public static readonly algebraicNotation = "--";

  public play() { }

  public getComputerNotation() {
    return "0";
  }
  public getAlgebraicNotation() {
    return NullMove.algebraicNotation;
  }

}