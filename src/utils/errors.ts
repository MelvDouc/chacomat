import { FenString } from "@chacomat/types.local.js";

export class InactiveGameError extends Error {
  constructor(status: string) {
    super(`Game is inactive: ${status}`);
  }
}

export class IllegalMoveError extends Error {
  constructor(message: string) {
    super(`Illegal move: ${message}`);
  }
}

export class InvalidAlgebraicNotationError extends Error {
  constructor(notation: string) {
    super(`Invalid algebraic notation: ${notation}`);
  }
}

export class InvalidFenError extends Error {
  constructor(fen: FenString) {
    super(`Invalid FEN string: "${fen}"`);
  }
}