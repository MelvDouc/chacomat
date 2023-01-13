export enum Color {
  WHITE = "WHITE",
  BLACK = "BLACK"
}

/**
 * These coincide with the rooks' initial files in a normal game.
 */
export enum Wing {
  QUEEN_SIDE = 0,
  KING_SIDE = 7
}

export enum GameStatus {
  ACTIVE = "active",
  CHECKMATE = "checkmate",
  STALEMATE = "stalemate",
  TRIPLE_REPETITION = "triple repetition",
  FIFTY_MOVE_DRAW = "draw by fifty-move rule",
  INSUFFICIENT_MATERIAL = "insufficient material"
}