import { Coords, FenString, GameStatus } from "@chacomat/types.js";

export class IllegalMoveError extends Error {
  constructor(srcCoords: Coords, destCoords: Coords) {
    super(`Illegal move: ${srcCoords.notation}-${destCoords.notation}`);
  }
}

export class InvalidCoordsError extends Error {
  constructor(arg: any) {
    super(`Invalid coordinates: ${arg}`);
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