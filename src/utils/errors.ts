import { Coords, FenString } from "@chacomat/types.local.js";

export class IllegalMoveError extends Error {
  constructor(srcCoords: Coords | null | undefined, destCoords: Coords | null | undefined) {
    super(`Illegal move from ${srcCoords?.notation} to ${destCoords?.notation}`);
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