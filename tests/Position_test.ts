import {
  ChessGame,
  Color,
  SquareIndex,
  Board,
  CastlingRights,
  Position,
  Pieces
} from "$src/index.js";
import { expect } from "chai";
import { describe, it } from "node:test";

describe("Parse from string", () => {
  it("#1", () => {
    const pos = Position.fromFEN("8/1k6/8/8/5P2/K7/8/8 b - f3 44 78");
    expect(pos.activeColor).to.equal(Color.Black);
    expect(pos.board.pieceCount).to.equal(3);
    expect(pos.enPassantIndex).to.equal(SquareIndex.f3);
    expect(pos.halfMoveClock).to.equal(44);
    expect(pos.fullMoveNumber).to.equal(78);
  });

  it("#2", () => {
    const game = ChessGame.fromPGN('[FEN "k1K5/8/8/8/8/8/8/8 b - - 0 1"] 1...Ka7 *');
    expect(game.firstPosition.toMoveString().startsWith("1...Ka7")).to.be.true;
  });
});

describe("Check", () => {
  it("#1", () => {
    const pos = Position.fromFEN("rnbqk1nr/pppp1ppp/4p3/8/1bPP4/8/PP2PPPP/RNBQKBNR w KQkq - 1 3");
    expect(pos.isCheck()).to.be.true;
  });

  it("#2", () => {
    const pos = Position.fromFEN("r3r3/pp3R1p/2n4k/5Bp1/2Q1p3/1P3qP1/P5KP/2B5 w - - 8 30");
    expect(pos.isCheck()).to.be.true;
  });
});

describe("Checkmate", () => {
  it("fool's mate", () => {
    const pos = Position.fromFEN("rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3");
    expect(pos.isCheckmate()).to.be.true;
  });

  it("smothered mate", () => {
    const pos = Position.fromFEN("6rk/5Npp/8/8/8/8/8/7K b - - 0 1");
    expect(pos.isCheckmate()).to.be.true;
  });

  it("B+N mate", () => {
    const pos = Position.fromFEN("8/8/8/8/8/2n5/1bk5/K7 w - - 0 1");
    expect(pos.isCheckmate()).to.be.true;
  });
});

describe("Stalemate", () => {
  it("#1", () => {
    const pos = Position.fromFEN("5bnr/4p1pq/4Qpkr/7p/7P/4P3/PPPP1PP1/RNB1KBNR b KQ - 2 10");
    expect(pos.isStalemate()).to.be.true;
  });
});

describe("Insufficient material", () => {
  it("kings only", () => {
    const pos = new Position({
      board: new Board(),
      activeColor: Color.White,
      castlingRights: new CastlingRights(),
      enPassantIndex: null,
      halfMoveClock: 0,
      fullMoveNumber: 1
    });
    pos.board.set(SquareIndex.e1, Pieces.WHITE_KING);
    pos.board.set(SquareIndex.e8, Pieces.BLACK_KING);
    expect(pos.isInsufficientMaterial()).to.be.true;
  });

  it("minor piece only", () => {
    expect(Position.fromFEN("k7/8/8/8/8/8/8/6BK w - - 0 1").isInsufficientMaterial()).to.be.true;
    expect(Position.fromFEN("kn6/8/8/8/8/8/8/7K b - - 0 1").isInsufficientMaterial()).to.be.true;
  });

  it("same-colored bishops", () => {
    expect(Position.fromFEN("kb6/8/8/8/8/8/8/BK6 w - - 0 1").isInsufficientMaterial()).to.be.true;
  });

  it("opposite-colored bishops", () => {
    expect(Position.fromFEN("kb6/8/8/8/8/8/8/KB6 w - - 0 1").isInsufficientMaterial()).to.be.false;
  });
});

describe("Triple repetition", () => {
  it("should be detected from initial position", () => {
    const game = ChessGame.fromPGN(`
      [Result "1/2-1/2"]
      1.Nf3 Nf6 2.Ng1 Ng8 3.Nf3 Nf6 4.Ng1 1/2-1/2
    `);
    expect(game.currentPosition.isTripleRepetition()).to.be.false;
    const move = game.currentPosition.findMoveByComputerNotation("f6g8")!;
    game.playMove(move);
    expect(game.currentPosition.isTripleRepetition()).to.be.true;
  });
});

describe("Other", () => {
  it("reversed position", () => {
    const pos = Position.fromFEN("rn1qkbnr/1bppp1pp/8/pP6/4PpP1/8/PP1PKP1P/RNBQ1BNR b kq g3 0 6");
    const { inactiveColor, castlingRights, board, enPassantIndex, halfMoveClock, fullMoveNumber } = pos.reverse();
    expect(pos.activeColor).to.equal(inactiveColor);
    expect(castlingRights.toString()).to.equal(pos.castlingRights.toString().toUpperCase());
    expect(board.pieceCount).to.equal(pos.board.pieceCount);
    expect(enPassantIndex).to.equal(SquareIndex.g6);
    expect(halfMoveClock).to.equal(pos.halfMoveClock);
    expect(fullMoveNumber).to.equal(pos.fullMoveNumber);
  });
});