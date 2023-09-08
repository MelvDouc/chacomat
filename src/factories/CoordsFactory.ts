import { Coordinates } from "@/types/types.ts";

export default function CoordsFactory(boardHeight: number, boardWidth: number) {
  const FILES = Array.from({ length: boardWidth }, (_, i) => String.fromCharCode(i + 97));

  const isSafe = (x: number, y: number) => x >= 0 && x < boardHeight && y >= 0 && y < boardWidth;
  const rankNameToX = (rank: string) => boardHeight - +rank;
  const fileNameToY = (file: string) => FILES.indexOf(file);
  const xToRankName = (x: number) => String(boardHeight - x);
  const yToFileName = (y: number) => FILES[y];

  class C implements Coordinates {
    constructor(public readonly x: number, public readonly y: number) { }

    get index() {
      return this.x * boardWidth + this.y;
    }

    get fileNotation() {
      return yToFileName(this.y);
    }

    get rankNotation() {
      return xToRankName(this.x);
    }

    get notation() {
      return this.fileNotation + this.rankNotation;
    }

    isLightSquare() {
      return this.x % 2 === this.y % 2;
    }

    getPeer(xOffset: number, yOffset: number) {
      return isSafe(this.x + xOffset, this.y + yOffset)
        ? Coords(this.x + xOffset, this.y + yOffset)
        : null;
    }

    *peers(xOffset: number, yOffset: number) {
      let { x, y } = this;

      while (isSafe(x += xOffset, y += yOffset)) {
        yield Coords(x, y);
      }
    }

    toJson() {
      return {
        x: this.x,
        y: this.y,
        index: this.index,
        notation: this.notation
      };
    }
  };

  const ALL = Array.from({ length: boardHeight }, (_, x) => {
    return Array.from({ length: boardWidth }, (_, y) => new C(x, y));
  });

  const Coords = (x: number, y: number) => ALL[x][y];

  Coords.isSafe = isSafe;
  Coords.rankNameToX = rankNameToX;
  Coords.fileNameToY = fileNameToY;
  Coords.xToRankName = xToRankName;
  Coords.yToFileName = yToFileName;

  Coords.fromIndex = (index: number) => {
    return Coords(Math.floor(index / boardWidth), index % boardWidth);
  };

  Coords.fromNotation = (notation: string) => {
    if (!/^[a-z]\d+$/.test(notation))
      return null;

    return Coords(rankNameToX(notation[1]), fileNameToY(notation[0]));
  };

  return Coords;
}