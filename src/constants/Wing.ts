export default class Wing {
  public static readonly QUEEN_SIDE = new this(-1);
  public static readonly KING_SIDE = new this(1);

  public static *cases(): Generator<Wing> {
    yield this.QUEEN_SIDE;
    yield this.KING_SIDE;
  }

  public static fromDirection(direction: number): Wing {
    return (direction < 0) ? this.QUEEN_SIDE : this.KING_SIDE;
  }

  private constructor(
    public readonly direction: number
  ) { }

  public get edge(): number {
    return this === Wing.QUEEN_SIDE ? 0 : 7;
  }

  public get opposite(): Wing {
    return this === Wing.QUEEN_SIDE ? Wing.KING_SIDE : Wing.QUEEN_SIDE;
  }

  public get castledKingY() {
    return this.direction === -1 ? 2 : 6;
  }

  public get castledRookY() {
    return this.castledKingY - this.direction;
  }
}