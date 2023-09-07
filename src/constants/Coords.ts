export default class Coords {
  protected static readonly FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
  public static readonly BOARD_HEIGHT: number = 8;
  public static readonly BOARD_WIDTH: number = 8;

  protected static readonly all = Array.from({ length: this.BOARD_HEIGHT }, (_, x) => {
    return Array.from({ length: this.BOARD_WIDTH }, (_, y) => {
      return new this(x, y);
    });
  });

  public static get(x: number, y: number) {
    return this.all[x][y];
  }

  public static isSafe(x: number, y: number): boolean {
    return x >= 0 && x < this.BOARD_HEIGHT && y >= 0 && y < this.BOARD_WIDTH;
  }

  public static fromIndex(index: number) {
    return this.get(Math.floor(index / this.BOARD_WIDTH), index % this.BOARD_WIDTH);
  }

  public static rankNameToX(rank: string) {
    return this.BOARD_HEIGHT - +rank;
  }

  public static fileNameToY(file: string) {
    return this.FILES.indexOf(file);
  }

  public static xToRankName(x: number) {
    return String(this.BOARD_HEIGHT - x);
  }

  public static yToFileName(y: number) {
    return this.FILES[y];
  }

  public static fromNotation(notation: string): Coords | null {
    if (!/^[a-h][1-8]$/.test(notation))
      return null;

    return this.get(this.rankNameToX(notation[1]), this.fileNameToY(notation[0]));
  }

  protected constructor(
    public readonly x: number,
    public readonly y: number
  ) { }

  public get index(): number {
    return this.x * (this.constructor as typeof Coords).BOARD_WIDTH + this.y;
  }

  public get fileNotation(): string {
    return (this.constructor as typeof Coords).yToFileName(this.y);
  }

  public get rankNotation(): string {
    return (this.constructor as typeof Coords).xToRankName(this.x);
  }

  public get notation(): string {
    return this.fileNotation + this.rankNotation;
  }

  public isLightSquare(): boolean {
    return this.x % 2 === this.y % 2;
  }

  public getPeer(xOffset: number, yOffset: number) {
    return (this.constructor as typeof Coords).isSafe(this.x + xOffset, this.y + yOffset)
      ? (this.constructor as typeof Coords).get(this.x + xOffset, this.y + yOffset)
      : null;
  }

  public *peers(xOffset: number, yOffset: number) {
    let peer = this.getPeer(xOffset, yOffset);

    while (peer) {
      yield peer;
      peer = peer.getPeer(xOffset, yOffset);
    }
  }
}