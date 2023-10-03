export default class Coords {
  static readonly ALL = Array.from({ length: 8 }, (_, x) => {
    return Array.from({ length: 8 }, (_, y) => new this(x, y));
  });

  static readonly FILES = Array.from({ length: 26 }, (_, i) => String.fromCharCode(i + 97));

  static isSafe(x: number, y: number) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
  }

  static fromNotation(notation: string) {
    if (!/[a-h][1-8]/.test(notation))
      return null;

    return this.ALL[8 - Number(notation[1])][this.FILES.indexOf(notation[0])];
  }

  readonly #notation: string;

  private constructor(
    public readonly x: number,
    public readonly y: number
  ) {
    this.#notation = String.fromCharCode(y + 97) + String(8 - x);
  }

  get notation() {
    return this.#notation;
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

export function coords(x: number, y: number) {
  return Coords.ALL[x][y];
}