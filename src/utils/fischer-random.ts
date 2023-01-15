import { WhitePieceInitial } from "@chacomat/utils/constants.js";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getChess960WhitePieceRank(): string {
  const pieceRank: WhitePieceInitial[] = [];
  const files = new Set(Array.from({ length: 8 }, (_, i) => i));

  const kingFile = getKingFile(files),
    [rookFile1, rookFile2] = getRookFiles(files, kingFile),
    [bishopFile1, bishopFile2] = getBishopFiles(files);
  const queenFile = [...files][randomInt(0, files.size - 1)];
  files.delete(queenFile);
  const [knightFile1, knightFile2] = [...files];

  pieceRank[kingFile] = WhitePieceInitial.KING;
  pieceRank[rookFile1] = WhitePieceInitial.ROOK;
  pieceRank[rookFile2] = WhitePieceInitial.ROOK;
  pieceRank[bishopFile1] = WhitePieceInitial.BISHOP;
  pieceRank[bishopFile2] = WhitePieceInitial.BISHOP;
  pieceRank[queenFile] = WhitePieceInitial.QUEEN;
  pieceRank[knightFile1] = WhitePieceInitial.KNIGHT;
  pieceRank[knightFile2] = WhitePieceInitial.KNIGHT;

  return pieceRank.join("");
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