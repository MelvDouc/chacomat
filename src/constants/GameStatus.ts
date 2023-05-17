enum GameStatus {
  ONGOING,
  CHECKMATE,
  STALEMATE,
  INSUFFICIENT_MATERIAL,
  TRIPLE_REPETITION,
  DRAW_BY_FIFTY_MOVE_RULE
}

export const GameResults = {
  ONGOING: "*",
  DRAW: "1/2-1/2",
  WHITE_WIN: "1-0",
  BLACK_WIN: "0-1",
  DOUBLE_LOSS: "0-0"
} as const;

export default GameStatus;