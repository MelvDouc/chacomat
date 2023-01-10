enum PieceType {
  PAWN,
  KNIGHT,
  BISHOP,
  ROOK,
  QUEEN,
  KING
}

export enum PieceByInitial {
  P = PieceType.PAWN,
  N = PieceType.KNIGHT,
  B = PieceType.BISHOP,
  R = PieceType.ROOK,
  Q = PieceType.QUEEN,
  K = PieceType.KING
}

export default PieceType;
