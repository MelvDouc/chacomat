import type {
  AlgebraicSquareNotation,
  ChessFileName,
  Coords
} from "@chacomat/types.js";

type CoordsConstructor = {
  (x: number, y: number): Coords;
  getFileNameIndex: (fileName: ChessFileName | Uppercase<ChessFileName>) => number;
  getFileName: (file: number) => ChessFileName;
  fromNotation: (notation: AlgebraicSquareNotation) => Coords | null;
  isSafe: (coordinate: number) => boolean;
};

const ALL_COORDS: Record<number, Record<number, { coords: Coords; notation: AlgebraicSquareNotation; }>> = {};
const coordsByNotation = {} as Record<AlgebraicSquareNotation, Coords>;

const Coords = function (x, y) {
  return ALL_COORDS[x][y].coords;
} as CoordsConstructor;

Coords.getFileNameIndex = (fileName: ChessFileName | Uppercase<ChessFileName>): number => {
  return fileName.toLowerCase().charCodeAt(0) - 97;
};

Coords.getFileName = (file: number): ChessFileName => {
  return String.fromCharCode(97 + file) as ChessFileName;
};

Coords.fromNotation = (notation: AlgebraicSquareNotation): Coords | null => {
  return coordsByNotation[notation] ?? null;
};

Coords.isSafe = (coordinate: number): boolean => {
  return coordinate >= 0 && coordinate < 8;
};

for (let x = 0; x < 8; x++) {
  ALL_COORDS[x] = {};
  for (let y = 0; y < 8; y++) {
    const coords = Object.create(Coords.prototype, {
      x: {
        value: x,
        writable: false,
        configurable: false,
        enumerable: true
      },
      y: {
        value: y,
        writable: false,
        configurable: false,
        enumerable: true
      },
      notation: {
        get() {
          return ALL_COORDS[x][y].notation;
        }
      },
      getPeer: {
        value: (xOffset: number, yOffset: number): Coords | null => {
          const x2 = x + xOffset,
            y2 = y + yOffset;
          if (Coords.isSafe(x2) && Coords.isSafe(y2))
            return ALL_COORDS[x2][y2].coords;
          return null;
        }
      }
    });

    const notation = Coords.getFileName(y) + String(8 - x) as AlgebraicSquareNotation;
    ALL_COORDS[x][y] = {
      coords,
      notation
    };
    coordsByNotation[notation] = coords;
  }
}

export default Coords;