import { colors } from "@chacomat/constants/Color.js";
import Board from "@chacomat/game/Board.js";
import Piece, { Pawn } from "@chacomat/pieces/index.js";
import type { King, NonPawnPieceType } from "@chacomat/types.local.js";
import Coords from "@chacomat/utils/Coords.js";
import { randomInt, removeAndReturnRandomElement } from "@chacomat/utils/random.js";

export default class Chess960Board extends Board {
  static #getRandomPieceFiles(): Record<NonPawnPieceType, number[]> {
    const files = Array.from({ length: 8 }, (_, i) => i);

    const darkSquaredBishopFile = [0, 2, 4, 6][randomInt(0, 3)];
    files.splice(darkSquaredBishopFile, 1);

    const lightSquaredBishopFile = [1, 3, 5, 7][randomInt(0, 3)];
    files.splice(files.indexOf(lightSquaredBishopFile), 1);

    const queenFile = removeAndReturnRandomElement(files);
    const knightFile1 = removeAndReturnRandomElement(files);
    const knightFile2 = removeAndReturnRandomElement(files);

    return {
      K: [files[1]],
      Q: [queenFile],
      R: [files[0], files[2]],
      B: [darkSquaredBishopFile, lightSquaredBishopFile],
      N: [knightFile1, knightFile2]
    };
  }

  static create(): Board {
    const board = new this();
    const pieceFiles = this.#getRandomPieceFiles();
    let pieceInitial: NonPawnPieceType;

    for (const color of colors) {
      const pieceRank = Piece.START_RANKS[color];

      for (pieceInitial in pieceFiles) {
        for (const y of pieceFiles[pieceInitial]) {
          const coords = Coords.get(pieceRank, y);
          const piece = Reflect.construct(Piece.pieceClassesByInitial.get(pieceInitial), [color]) as Piece;
          piece.board = board;
          board.set(coords, piece);
        }
      }

      board.kings[color] = board.atX(pieceRank).atY(pieceFiles.K[0]) as King;

      for (let y = 0; y < 8; y++) {
        const coords = Coords.get(Pawn.START_RANKS[color], y);
        const pawn = new Pawn(color);
        pawn.board = board;
        board.set(coords, pawn);
      }
    }

    return board;
  }
}