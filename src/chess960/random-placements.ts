import type { NonPawnPieceType } from "@chacomat/types.local.js";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getChess960PiecePlacement(): Record<NonPawnPieceType, number[]> {
  const files = Array.from({ length: 8 }, (_, i) => i);

  const darkSquaredBishopFile = [0, 2, 4, 6][randomInt(0, 3)];
  files.splice(darkSquaredBishopFile, 1);

  const lightSquaredBishopFile = [1, 3, 5, 7][randomInt(0, 3)];
  files.splice(files.indexOf(lightSquaredBishopFile), 1);

  const queenFile = files[randomInt(0, files.length - 1)];
  files.splice(files.indexOf(queenFile), 1);

  const knightFile1 = files[randomInt(0, files.length - 1)];
  files.splice(files.indexOf(knightFile1), 1);

  const knightFile2 = files[randomInt(0, files.length - 1)];
  files.splice(files.indexOf(knightFile2), 1);

  const [rookFile1, kingFile, rookFile2] = files;


  return {
    K: [kingFile],
    Q: [queenFile],
    R: [rookFile1, rookFile2],
    B: [darkSquaredBishopFile, lightSquaredBishopFile],
    N: [knightFile1, knightFile2]
  };
}