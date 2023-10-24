export default class Coords {
  static readonly #FILES = Array.from({ length: 26 }, (_, i) => String.fromCharCode(i + 97));

  static readonly ALL = Array.from({ length: 8 }, (_, x) => {
    return Array.from({ length: 8 }, (_, y) => new this(x, y));
  });

  static isSafe(x: number, y: number) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
  }

  static xToFileName(x: number) {
    return this.#FILES[x];
  }

  static yToRankName(y: number) {
    return String(8 - y);
  }

  static fileNameToX(fileName: string) {
    return this.#FILES.indexOf(fileName);
  }

  static rankNameToY(rankName: string) {
    return 8 - Number(rankName);
  }

  static fromNotation(notation: string) {
    if (!/[a-h][1-8]/.test(notation))
      return null;

    const [fileName, rankName] = notation;
    return this.ALL[this.fileNameToX(fileName)][this.rankNameToY(rankName)];
  }

  readonly #notation: string;

  private constructor(
    public readonly x: number,
    public readonly y: number
  ) {
    this.#notation = Coords.xToFileName(x) + Coords.yToRankName(y);
  }

  get notation() {
    return this.#notation;
  }

  get fileName() {
    return this.#notation[0];
  }

  get rankName() {
    return this.#notation[1];
  }

  isLightSquare() {
    return this.x % 2 === this.y % 2;
  }

  peer(xOffset: number, yOffset: number) {
    const x = this.x + xOffset,
      y = this.y + yOffset;

    return Coords.isSafe(x, y)
      ? Coords.ALL[x][y]
      : null;
  }

  *peers(xOffset: number, yOffset: number) {
    let coords = this.peer(xOffset, yOffset);

    while (coords) {
      yield coords;
      coords = coords.peer(xOffset, yOffset);
    }
  }

  toJSON() {
    return {
      x: this.x,
      y: this.y
    };
  }
}

export const coords = Coords.ALL;