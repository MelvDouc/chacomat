import { FenString } from "@chacomat/types.local.js";

export class IllegalMoveError extends Error {
  constructor(src: unknown, dest: unknown) {
    super(`Illegal move from ${src} to ${dest}`);
  }
}

export class InactiveGameError extends Error {
  constructor(status: string) {
    super(`Game is inactive: ${status}`);
  }
}

export class InvalidFenError extends Error {
  constructor(fen: FenString) {
    super(`Invalid FEN string: "${fen}"`);
  }
}