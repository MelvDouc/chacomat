import Piece from "../dist/constants/Piece.js";
import Position from "../dist/game/Position.js";
import { expect, test } from "./utils.js";

test("legal moves #1", () => {
  const pos = Position.fromFen(Position.START_FEN);

  expect(pos.legalMoves).count(16, ({ srcCoords }) => pos.board.get(srcCoords) === Piece.WHITE_PAWN);
  expect(pos.legalMoves).count(4, ({ srcCoords }) => pos.board.get(srcCoords) === Piece.WHITE_KNIGHT);
});