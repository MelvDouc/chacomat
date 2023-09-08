const PositionStatuses = {
  ON_GOING: "ongoing",
  CHECKMATE: "checkmate",
  STALEMATE: "stalemate",
  FIFTY_MOVE_RULE: "50-move rule",
  INSUFFICIENT_MATERIAL: "insufficient material",
  TRIPLE_REPETITION: "triple repetition"
} as const;

export default PositionStatuses;