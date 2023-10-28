import ChessGame from "@/game/ChessGame.ts";
import CastlingMove from "@/moves/CastlingMove.ts";
import PawnMove from "@/moves/PawnMove.ts";
import { Board, Color, Pieces, Position, coords } from "../mod.ts";
import { assert, assertArrayIncludes, assertEquals, assertFalse } from "./test.index.ts";

function cl(...args: ConstructorParameters<typeof CastlingMove>) {
  return new CastlingMove(...args);
}

Deno.test("castling side", () => {
  assert(cl(coords[4][7], 0, Color.WHITE).isQueenSide());
  assertFalse(cl(coords[4][7], 7, Color.WHITE).isQueenSide());
});

Deno.test("castling notation", () => {
  assertEquals(cl(coords[4][0], 0, Color.BLACK).algebraicNotation(), "0-0-0");
  assertEquals(cl(coords[4][0], 7, Color.BLACK).algebraicNotation(), "0-0");
});

Deno.test("castling legality", () => {
  const board = Board.fromString("rn2k2r/8/8/8/8/8/7p/R3K2R");
  const coordsAttackedByWhite = board.getAttackedCoordsSet(Color.WHITE);
  const coordsAttackedByBlack = board.getAttackedCoordsSet(Color.BLACK);
  assert(
    cl(coords[4][7], 0, Color.WHITE).isLegal(board, coordsAttackedByBlack)
  );
  assertFalse(
    cl(coords[4][7], 7, Color.WHITE).isLegal(board, coordsAttackedByBlack)
  );
  assertFalse(
    cl(coords[4][0], 0, Color.BLACK).isLegal(board, coordsAttackedByWhite)
  );
  assert(
    cl(coords[4][0], 7, Color.BLACK).isLegal(board, coordsAttackedByWhite)
  );
});

Deno.test("ambiguous notation", () => {
  const pos = Position.fromFEN("8/8/2QQ4/8/3Q4/5K2/8/7k w - - 0 1");
  assertArrayIncludes(
    pos.legalMovesAsAlgebraicNotation,
    ["Qcd5", "Q4d5", "Qd6d5"]
  );
});

Deno.test("promotion", () => {
  const move = new PawnMove(coords[0][1], coords[0][0], Pieces.WHITE_PAWN, null, false);
  assert(move.isPromotion());
  move.promotedPiece = Pieces.WHITE_QUEEN;
  assertEquals(move.algebraicNotation(), "a8=Q");
  move.promotedPiece = Pieces.BLACK_KNIGHT;
  assertEquals(move.algebraicNotation(), "a8=N");
});

Deno.test("underpromotion and capture", () => {
  const game = new ChessGame(`
    [FEN "8/5pkp/b5p1/p7/P4P2/8/1pp2NPP/R6K b - - 1 32"]
    [Result "*"] *
  `);
  assertArrayIncludes(
    game.currentPosition.legalMovesAsAlgebraicNotation,
    ["bxa1=R"]
  );
});

Deno.test("en passant", () => {
  const position = Position.fromFEN("6k1/8/8/2pP4/8/8/8/2K5 w - c6 0 1");
  const move = position.legalMoves.find(({ destCoords }) => destCoords.x === 2 && destCoords.y === 2);
  assert(move instanceof PawnMove && move.isEnPassant);
  move.play(position.board);
  assertEquals(position.board.get(coords[2][2]), move.srcPiece);
  assertFalse(position.board.has(coords[3][3]));
  assertFalse(position.board.has(coords[3][3]));
});