export default class Coords {
  private static readonly FILES = "abcdefgh";
  private static readonly all = Array.from({ length: 8 }, (_, x) => {
    return Array.from({ length: 8 }, (_, y) => new Coords(x, y));
  });

  public static get(x: number, y: number): Coords {
    return this.all[x][y];
  }

  public static isSafe(coordinate: number): boolean {
    return coordinate >= 0 && coordinate < 8;
  }

  public static fromIndex(index: number): Coords {
    return this.get(Math.floor(index / 8), index % 8);
  }

  public static rankNameToX(rank: string) {
    return 8 - +rank;
  }

  public static fileNameToY(file: string) {
    return this.FILES.indexOf(file);
  }

  public static fromNotation(notation: string): Coords | null {
    if (!/^[a-h][1-8]$/.test(notation))
      return null;

    return this.get(this.rankNameToX(notation[1]), this.fileNameToY(notation[0]));
  }

  private constructor(
    public readonly x: number,
    public readonly y: number
  ) { }

  public get index(): number {
    return this.x * 8 + this.y;
  }

  public get fileNotation(): string {
    return Coords.FILES[this.y];
  }

  public get rankNotation(): string {
    return String(8 - this.x);
  }

  public get notation(): string {
    return this.fileNotation + this.rankNotation;
  }

  public isLightSquare(): boolean {
    return this.x % 2 === this.y % 2;
  }

  public getPeer(xOffset: number, yOffset: number): Coords | null {
    if (!Coords.isSafe(this.x + xOffset) || !Coords.isSafe(this.y + yOffset))
      return null;
    return Coords.get(this.x + xOffset, this.y + yOffset);
  }

  public *peers(xOffset: number, yOffset: number): Generator<Coords> {
    let peer = this.getPeer(xOffset, yOffset);

    while (peer) {
      yield peer;
      peer = peer.getPeer(xOffset, yOffset);
    }
  }
}