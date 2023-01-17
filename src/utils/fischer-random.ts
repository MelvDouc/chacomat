import { PieceType } from "@chacomat/utils/constants.js";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getChess960PiecePlacement(): Record<Exclude<PieceType, (typeof PieceType)["PAWN"]>, number[]> {
  const files = new Set(Array.from({ length: 8 }, (_, i) => i));

  const kingFile = getKingFile(files),
    rookFiles = getRookFiles(files, kingFile),
    bishopFiles = getBishopFiles(files);
  const queenFile = [...files][randomInt(0, files.size - 1)];
  files.delete(queenFile);

  return {
    [PieceType.KING]: [kingFile],
    [PieceType.QUEEN]: [queenFile],
    [PieceType.ROOK]: rookFiles,
    [PieceType.BISHOP]: bishopFiles,
    [PieceType.KNIGHT]: [...files]
  };
}

function getKingFile(files: Set<number>): number {
  const kingFile = randomInt(1, 6);
  files.delete(kingFile);
  return kingFile;
}

function getRookFiles(files: Set<number>, kingFile: number): number[] {
  const rookFiles = [
    randomInt(0, kingFile - 1),
    randomInt(kingFile + 1, 7),
  ];
  files.delete(rookFiles[0]);
  files.delete(rookFiles[1]);
  return rookFiles;
}

function getBishopFiles(files: Set<number>): number[] {
  const bishopFile1 = [...files][randomInt(0, files.size - 1)];
  files.delete(bishopFile1);

  const remainingFiles = [...files].filter((n) => n % 2 !== bishopFile1 % 2);
  const bishopFile2 = remainingFiles[randomInt(0, remainingFiles.length - 1)];
  files.delete(bishopFile2);

  return [bishopFile1, bishopFile2];
}