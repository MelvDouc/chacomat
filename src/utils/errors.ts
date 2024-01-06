export class IllegalMoveError extends Error { }

export class InvalidFENError extends Error {
  public constructor(fen: string) {
    super(`Invalid FEN: ${fen}.`, { cause: { FEN: fen } });
  }
}