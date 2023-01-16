import { FenString, GameStatus } from "@chacomat/types.js";

export class IllegalMoveError extends Error {
  constructor(srcCoords: { x: number; y: number; }, destCoords: { x: number; y: number; }) {
    super(`Illegal move: ${JSON.stringify(srcCoords)}-${JSON.stringify(destCoords)}`);
  }
}

export class InactiveGameError extends Error {
  constructor(status: GameStatus) {
    super(`Game is inactive: ${status}`);
  }
}

export class InvalidFenError extends Error {
  constructor(fen: FenString) {
    super(`Invalid FEN string: "${fen}"`);
  }
}