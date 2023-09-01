export default class Wing {
  public static readonly QUEEN_SIDE = new this(2, 3);
  public static readonly KING_SIDE = new this(6, 5);

  public static *cases(): Generator<Wing> {
    yield this.QUEEN_SIDE;
    yield this.KING_SIDE;
  }

  public static fromDirection(direction: number): Wing {
    return (direction < 0) ? this.QUEEN_SIDE : this.KING_SIDE;
  }

  private constructor(
    public readonly castledKingY: number,
    public readonly castledRookY: number
  ) { }

  public get edge(): number {
    return this === Wing.QUEEN_SIDE ? 0 : 7;
  }

  public get opposite(): Wing {
    return this === Wing.QUEEN_SIDE ? Wing.KING_SIDE : Wing.QUEEN_SIDE;
  }
}