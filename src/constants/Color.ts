export default class Color {
  public static readonly White = new this("WHITE", 1);
  public static readonly Black = new this("BLACK", -1);

  public static fromAbbreviation(abbreviation: string) {
    switch (abbreviation) {
      case "w":
        return this.White;
      case "b":
        return this.Black;
      default:
        throw new Error(`Invalid abbreviation "${abbreviation}".`);
    }
  }

  protected constructor(
    public readonly name: string,
    public readonly direction: number
  ) { }

  public get abbreviation() {
    return this.isWhite() ? "w" : "b";
  }

  public get initialPieceRank() {
    return this.isWhite() ? 0 : (8 - 1);
  }

  public get initialPawnRank() {
    return this.initialPieceRank + this.direction;
  }

  public get opposite() {
    return this.isWhite() ? Color.Black : Color.White;
  }

  public isWhite() {
    return this === Color.White;
  }
}