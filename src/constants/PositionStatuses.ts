const PositionStatuses = {
  ONGOING: "ongoing",
  CHECKMATE: "checkmate",
  STALEMATE: "stalemate",
  INSUFFICIENT_MATERIAL: "insufficient material",
  FIFTY_MOVE_RULE: "draw by fifty-move rule",
  TRIPLE_REPETITION: "triple repetition"
} as const;

export default PositionStatuses;