import Colors from "$src/constants/Colors";
import SquareIndex from "$src/constants/SquareIndex";
import Board from "$src/game/Board";
import ChessGame from "$src/game/ChessGame";
import Position from "$src/game/Position";
import CastlingMove from "$src/moves/CastlingMove";
import PawnMove from "$src/moves/PawnMove";
import Pieces from "$src/pieces/Pieces";
import { expect, test } from "bun:test";

function cMove(arg: ConstructorParameters<typeof CastlingMove>[0]) {
  return new CastlingMove(arg);
}

test("castling notation", () => {
  expect(cMove({ color: Colors.WHITE, wing: "queenSide" }).getAlgebraicNotation()).toInclude("0-0-0");
  expect(cMove({ color: Colors.BLACK, wing: "kingSide" }).getAlgebraicNotation()).toInclude("0-0");
});

test("castling legality", () => {
  const board = Board.fromString("rn2k2r/8/8/8/8/8/7p/R3K2R");
  const whiteAttacks = board.getColorAttacks(Colors.WHITE);
  const blackAttacks = board.getColorAttacks(Colors.BLACK);
  expect(cMove({ color: Colors.WHITE, wing: "queenSide" }).isLegal(board, blackAttacks)).toBeTrue();
  expect(cMove({ color: Colors.WHITE, wing: "kingSide" }).isLegal(board, blackAttacks)).toBeFalse();
  expect(cMove({ color: Colors.BLACK, wing: "queenSide" }).isLegal(board, whiteAttacks)).toBeFalse();
  expect(cMove({ color: Colors.BLACK, wing: "kingSide" }).isLegal(board, whiteAttacks)).toBeTrue();
});

test("ambiguous notation", () => {
  const pos = Position.fromFEN("8/8/2QQ4/8/3Q4/5K2/8/7k w - - 0 1");
  const { legalMovesAsAlgebraicNotation } = pos;
  expect(legalMovesAsAlgebraicNotation).toContain("Qcd5");
  expect(legalMovesAsAlgebraicNotation).toContain("Q4d5");
  expect(legalMovesAsAlgebraicNotation).toContain("Qd6d5");
});

test("promotion", () => {
  const move = new PawnMove({
    srcIndex: SquareIndex.a7,
    destIndex: SquareIndex.a8,
    srcPiece: Pieces.WHITE_PAWN,
    destPiece: null,
    isEnPassant: false
  });
  expect(move.isPromotion()).toBeTrue();
  move.setPromotedPiece(Pieces.WHITE_QUEEN);
  expect(move.getAlgebraicNotation()).toEqual("a8=Q");
  move.setPromotedPiece(Pieces.WHITE_KNIGHT);
  expect(move.getAlgebraicNotation()).toEqual("a8=N");
});

test("underpromotion and capture", () => {
  const pgn = `
    [FEN "8/5pkp/b5p1/p7/P4P2/8/1pp2NPP/R6K b - - 1 32"]
    [Result "*"] *
  `;
  const game = ChessGame.fromPGN(pgn);
  expect(game.currentPosition.legalMovesAsAlgebraicNotation).toContain("bxa1=R");
});

test("en passant", () => {
  const { legalMoves, board } = Position.fromFEN("8/8/8/2pP4/8/8/8/k1K5 w - c6 0 1");
  const move = legalMoves.find(({ destNotation }) => destNotation === "c6");

  expect(move).toBeInstanceOf(PawnMove);
  expect((move as PawnMove).isEnPassant()).toBeTrue();

  move!.play(board);

  expect(board.get(SquareIndex.c6)).toEqual(move!.srcPiece);
  expect(board.has(SquareIndex.d5)).toBeFalse();
  expect(board.has(SquareIndex.c5)).toBeFalse();
});