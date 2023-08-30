export default class Color {
  public static readonly WHITE = new this("w");
  public static readonly BLACK = new this("b");

  private static readonly directions = {
    [this.WHITE.abbreviation]: -1,
    [this.BLACK.abbreviation]: 1
  };

  private static readonly abbreviations = {
    [this.WHITE.abbreviation]: this.WHITE,
    [this.BLACK.abbreviation]: this.BLACK
  };

  private static readonly initialRanks = {
    pieces: {
      [this.WHITE.abbreviation]: 7,
      [this.BLACK.abbreviation]: 0
    },
    pawns: {
      [this.WHITE.abbreviation]: 6,
      [this.BLACK.abbreviation]: 1
    }
  };

  public static *cases(): Generator<Color> {
    yield this.WHITE;
    yield this.BLACK;
  }

  public static fromAbbreviation(abbreviation: string): Color {
    return this.abbreviations[abbreviation];
  }

  private constructor(public readonly abbreviation: string) { }

  public get direction(): number {
    return Color.directions[this.abbreviation];
  }

  public get initialPawnRank(): number {
    return Color.initialRanks.pawns[this.abbreviation];
  }

  public get initialPieceRank(): number {
    return Color.initialRanks.pieces[this.abbreviation];
  }

  public get opposite(): Color {
    switch (this) {
      case Color.WHITE:
        return Color.BLACK;
      case Color.BLACK:
        return Color.WHITE;
      default:
        throw new Error("Invalid color.");
    }
  }
}