import { WhitePieceInitial } from "@chacomat/utils/constants.js";
import Coords from "@chacomat/game/Coords.js";
import { FenString } from "@chacomat/types.js";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getChess960FenString(): FenString {
  const pieces: WhitePieceInitial[] = [];
  const files = new Set(Array.from({ length: 8 }, (_, i) => i));

  const kingFile = getKingFile(files),
    [rookFile1, rookFile2] = getRookFiles(files, kingFile),
    [bishopFile1, bishopFile2] = getBishopFiles(files);
  const queenFile = [...files][randomInt(0, files.size - 1)];
  files.delete(queenFile);
  const [knightFile1, knightFile2] = [...files];

  pieces[kingFile] = WhitePieceInitial.KING;
  pieces[rookFile1] = WhitePieceInitial.ROOK;
  pieces[rookFile2] = WhitePieceInitial.ROOK;
  pieces[bishopFile1] = WhitePieceInitial.BISHOP;
  pieces[bishopFile2] = WhitePieceInitial.BISHOP;
  pieces[queenFile] = WhitePieceInitial.QUEEN;
  pieces[knightFile1] = WhitePieceInitial.KNIGHT;
  pieces[knightFile2] = WhitePieceInitial.KNIGHT;

  const pieceRank = pieces.join("");
  const rookFileName1 = Coords.getFileName(rookFile1),
    rookFileName2 = Coords.getFileName(rookFile2);
  const castlingStr = [
    rookFileName1.toUpperCase(),
    rookFileName2.toUpperCase(),
    rookFileName1,
    rookFileName2
  ].join("");

  return `${pieceRank.toLowerCase()}/${"p".repeat(8)}${"/8".repeat(4)}/${"P".repeat(8)}/${pieceRank} w ${castlingStr} - 0 1`;
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