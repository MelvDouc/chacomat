import Color from "../constants/Color.js";
import type {
  BlackAndWhite,
  Board,
  ChessRank,
  Coords,
  CoordsGenerator,
  Position,
  Piece
} from "../types.js";

const INITIAL_PAWN_RANKS: BlackAndWhite<ChessRank> = {
  [Color.WHITE]: 6,
  [Color.BLACK]: 1,
};

function* forwardMoves(
  color: Color,
  srcCoords: Coords,
  board: Board,
): CoordsGenerator {
  const coords1 = {
    x: srcCoords.x - color,
    y: srcCoords.y,
  };

  if (board.get(coords1))
    return;

  yield coords1;

  if (srcCoords.x !== INITIAL_PAWN_RANKS[color])
    return;

  const coords2 = {
    x: coords1.x - color,
    y: coords1.y,
  };

  if (!board.get(coords2))
    yield coords2;
}

function* captures(
  pawn: Piece,
  srcCoords: Coords,
  position: Position,
): CoordsGenerator {
  for (const destCoords of pawn.attackedCoords(srcCoords, position.board))
    if (
      position.board.get(destCoords)?.color === pawn.oppositeColor
      || destCoords.y === position.enPassantFile && srcCoords.x === pawn.oppositeMidRank
    )
      yield destCoords;
}

function* pseudoLegalMoves(
  pawn: Piece,
  srcCoords: Coords,
  position: Position,
): CoordsGenerator {
  yield* forwardMoves(pawn.color, srcCoords, position.board);
  yield* captures(pawn, srcCoords, position);
}

export default pseudoLegalMoves;
