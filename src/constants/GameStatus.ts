enum GameStatus {
  ACTIVE = "active",
  CHECKMATE = "checkmate",
  STALEMATE = "stalemate",
  FIFTY_MOVE_DRAW = "draw by fifty-move rule",
  INSUFFICIENT_MATERIAL = "insufficient material"
}

export default GameStatus;
