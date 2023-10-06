export default class Color {
  // ===== ===== ===== ===== =====
  // STATIC PUBLIC
  // ===== ===== ===== ===== =====

  static readonly WHITE = new this("white", -1);
  static readonly BLACK = new this("black", 1);

  static *cases() {
    yield this.WHITE;
    yield this.BLACK;
  }

  static fromDirection(direction: number): Color {
    return this.#from("direction", direction);
  }

  static fromName(name: string) {
    return this.#from("name", name);
  }

  static fromAbbreviation(abbreviation: string) {
    return this.#from("abbreviation", abbreviation);
  }

  // ===== ===== ===== ===== =====
  // STATIC PRIVATE
  // ===== ===== ===== ===== =====

  static readonly #pieceRanks = {
    [this.WHITE.name]: 8 - 1,
    [this.BLACK.name]: 0
  };

  static readonly #pawnRanks = {
    [this.WHITE.name]: 8 - 2,
    [this.BLACK.name]: 1
  };

  static #from<K extends keyof Color>(key: K, value: Color[K]) {
    for (const color of this.cases())
      if (color[key] === value)
        return color;
    throw new Error(`Invalid ${key}: ${value}.`);
  }

  // ===== ===== ===== ===== =====
  // PUBLIC
  // ===== ===== ===== ===== =====

  readonly name: string;
  readonly direction: number;

  constructor(name: string, direction: number) {
    this.name = name;
    this.direction = direction;
  }

  get abbreviation() {
    return this.name[0];
  }

  get opposite() {
    return Color.fromDirection(-this.direction);
  }
}