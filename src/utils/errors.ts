import { Coords, FenString } from "@chacomat/types.local.js";
import { coordsToNotation } from "@chacomat/utils/Index.js";

export class IllegalMoveError extends Error {
  constructor(src: Coords, dest: Coords) {
    super(`Illegal move from ${coordsToNotation(src)} to ${coordsToNotation(dest)}`);
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