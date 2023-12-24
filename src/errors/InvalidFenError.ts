export default class InvalidFenError extends Error {
  public readonly fen: string;

  public constructor(fen: string) {
    super(`Invalid FEN string "${fen}".`);
    this.fen = fen;
  }
}