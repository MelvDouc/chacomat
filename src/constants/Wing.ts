export default class Wing {
  public static readonly QUEEN_SIDE = new this(0, 2, 3);
  public static readonly KING_SIDE = new this(7, 6, 5);

  public static *cases(): Generator<Wing> {
    yield this.QUEEN_SIDE;
    yield this.KING_SIDE;
  }

  public static fromDirection(direction: number): Wing {
    return (direction < 0) ? this.QUEEN_SIDE : this.KING_SIDE;
  }

  private constructor(
    public readonly edge: number,
    public readonly castledKingY: number,
    public readonly castledRookY: number
  ) { }

  public get opposite(): Wing {
    switch (this) {
      case Wing.QUEEN_SIDE:
        return Wing.KING_SIDE;
      case Wing.KING_SIDE:
        return Wing.QUEEN_SIDE;
      default:
        throw new Error("Invalid wing.");
    }
  }
}