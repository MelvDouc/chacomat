import CastlingMove from "$src/moves/CastlingMove.js";
import PawnMove from "$src/moves/PawnMove.js";
import {
  Color,
  SquareIndex,
  Board,
  ChessGame,
  Position,
  Pieces,
  type ChacoMat
} from "$src/index.js";
import { expect } from "chai";
import assert from "node:assert";
import { describe, it } from "node:test";

describe("A castling move", () => {
  const cMove = (color: Color, wing: ChacoMat.Wing) => new CastlingMove({ color, wing });

  it("should have the right notation", () => {
    expect(cMove(Color.White, "queenSide").getAlgebraicNotation()).to.equal("0-0-0");
    expect(cMove(Color.Black, "kingSide").getAlgebraicNotation()).to.equal("0-0");
  });

  it("should know when it's legal", () => {
    const board = Board.fromString("rn2k2r/8/8/8/8/8/7p/R3K2R");
    const whiteAttacks = board.getColorAttacks(Color.White);
    const blackAttacks = board.getColorAttacks(Color.Black);
    expect(cMove(Color.White, "queenSide").isLegal(board, blackAttacks)).to.be.true;
    expect(cMove(Color.White, "kingSide").isLegal(board, blackAttacks)).to.be.false;
    expect(cMove(Color.Black, "queenSide").isLegal(board, whiteAttacks)).to.be.false;
    expect(cMove(Color.Black, "kingSide").isLegal(board, whiteAttacks)).to.be.true;
  });
});

describe("A piece move", () => {
  it("should detect ambiguous notation", () => {
    const pos = Position.fromFEN("8/8/2QQ4/8/3Q4/5K2/8/7k w - - 0 1");
    const { legalMovesAsAlgebraicNotation } = pos;
    expect(legalMovesAsAlgebraicNotation).to.include("Qcd5");
    expect(legalMovesAsAlgebraicNotation).to.include("Q4d5");
    expect(legalMovesAsAlgebraicNotation).to.include("Qd6d5");
  });
});

describe("A pawn move", () => {
  it("should handle promotion", () => {
    const move = new PawnMove({
      srcIndex: SquareIndex.a7,
      destIndex: SquareIndex.a8,
      srcPiece: Pieces.WHITE_PAWN,
      destPiece: null,
      isEnPassant: false
    });
    expect(move.isPromotion()).to.be.true;
    move.setPromotedPiece(Pieces.WHITE_QUEEN);
    expect(move.getAlgebraicNotation()).to.equal("a8=Q");
    move.setPromotedPiece(Pieces.WHITE_KNIGHT);
    expect(move.getAlgebraicNotation()).to.equal("a8=N");
  });

  it("should handle underpromotion and capture", () => {
    const pgn = `
      [FEN "8/5pkp/b5p1/p7/P4P2/8/1pp2NPP/R6K b - - 1 32"]
      [Result "*"] *
    `;
    const game = ChessGame.fromPGN(pgn);
    expect(game.currentPosition.legalMovesAsAlgebraicNotation).to.include("bxa1=R");
  });

  it("should handle en passant", () => {
    const { legalMoves, board } = Position.fromFEN("8/8/8/2pP4/8/8/8/k1K5 w - c6 0 1");
    const move = legalMoves.find(({ destPoint }) => destPoint.notation === "c6");
    assert(move instanceof PawnMove);
    expect(move.isEnPassant()).to.be.true;

    move.play(board);
    expect(board.get(SquareIndex.c6)).to.equal(move.srcPiece);
    expect(board.has(SquareIndex.d5)).to.be.false;
    expect(board.has(SquareIndex.c5)).to.be.false;
  });
});