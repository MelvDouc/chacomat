import Wing from "../constants/Wing.js";
import type { WhitePieceInitial, Wings } from "../types.js";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomChessWhitePieceRank() {
  const pieceRank: WhitePieceInitial[] = [];
  const files = new Set(Array.from({ length: 8 }, (_, i) => i));

  const kingFile = getKingFile(files),
    rookFiles = getRookFiles(files, kingFile),
    [bishopFile1, bishopFile2] = getBishopFiles(files);
  const queenFile = [...files][randomInt(0, files.size - 1)];
  files.delete(queenFile);
  const [knightFile1, knightFile2] = [...files];

  pieceRank[kingFile] = "K";
  pieceRank[rookFiles[Wing.QUEEN_SIDE]] = "R";
  pieceRank[rookFiles[Wing.KING_SIDE]] = "R";
  pieceRank[bishopFile1] = "B";
  pieceRank[bishopFile2] = "B";
  pieceRank[queenFile] = "Q";
  pieceRank[knightFile1] = "N";
  pieceRank[knightFile2] = "N";

  return pieceRank.join("");
}

function getKingFile(files: Set<number>): number {
  const kingFile = randomInt(1, 6);
  files.delete(kingFile);
  return kingFile;
}

function getRookFiles(files: Set<number>, kingFile: number): Wings<number> {
  const rookFiles = {
    [Wing.QUEEN_SIDE]: randomInt(0, kingFile - 1),
    [Wing.KING_SIDE]: randomInt(kingFile + 1, 7),
  };
  files.delete(rookFiles[Wing.QUEEN_SIDE]);
  files.delete(rookFiles[Wing.KING_SIDE]);
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