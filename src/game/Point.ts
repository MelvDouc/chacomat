import { SquareIndex, BOARD_LENGTH } from "$src/game/constants.js";

export default class Point {
  public static readonly fileNames = ["a", "b", "c", "d", "e", "f", "g", "h"];

  public static get(y: number, x: number) {
    return this.table[y][x];
  }

  public static fromIndex(index: number) {
    return this.indexTable[index];
  }

  public static fromNotation(notation: string) {
    return this.indexTable[SquareIndex[notation as keyof typeof SquareIndex]];
  }

  public static all() {
    return this.table;
  }

  public static invert(coordinate: number) {
    return BOARD_LENGTH - coordinate - 1;
  }

  public static randomCoordinate() {
    return Math.floor(Math.random() * BOARD_LENGTH);
  }

  public static randomPoint() {
    return this.get(this.randomCoordinate(), this.randomCoordinate());
  }

  public static isSafe(coordinate: number) {
    return coordinate >= 0 && coordinate < BOARD_LENGTH;
  }

  private static readonly table = Array.from({ length: BOARD_LENGTH }, (_, y) => {
    return Array.from({ length: BOARD_LENGTH }, (_, x) => {
      return new this(y, x);
    });
  });

  private static readonly indexTable = Array.from({ length: BOARD_LENGTH * BOARD_LENGTH }, (_, i) => {
    return this.table[Math.floor(i / BOARD_LENGTH)][i % BOARD_LENGTH];
  });

  private constructor(
    public readonly y: number,
    public readonly x: number
  ) { }

  public get index() {
    return this.y * BOARD_LENGTH + this.x;
  }

  public get rankNotation() {
    return this.notation[1];
  }

  public get fileNotation() {
    return this.notation[0];
  }

  public get notation() {
    return SquareIndex[this.index];
  }

  public isLightSquare() {
    return (this.y % 2 === 0) === (this.x % 2 === 0);
  }

  public invertY() {
    return Point.get(Point.invert(this.y), this.x);
  }

  public invertX() {
    return Point.get(this.y, Point.invert(this.x));
  }

  public invert() {
    return Point.get(Point.invert(this.y), Point.invert(this.x));
  }
}