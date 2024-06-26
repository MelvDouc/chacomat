import { ChessGame, Pieces, Position, SquareIndex } from "$src/index.js";
import { expect } from "chai";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const pgn1 = await readFile(`${process.cwd()}/pgn-files/long-engine-game1.pgn`, "utf-8");

describe("A chess game", () => {
  it("should handle variations", () => {
    const moveStr = "1.e4 ( 1.d4 d5 ( 1...Nf6 ) 2.c4 ( 2.Bg5 ) 2...c5 ) ( 1.c4 ) 1...Nc6 ( 1...d5 2.exd5 e5 3.dxe6 ) 2.Nf3 d6 3.Bc4 Bg4 4.0-0 Qd7 5.c3 0-0-0 *";
    const game = ChessGame.fromPGN(`[Result "*"] ${moveStr}`);
    const pgn = game.toPGN();
    expect(pgn).to.include(moveStr);
  });

  it("should be able to parse a long game", () => {
    const input = pgn1;
    const game = ChessGame.fromPGN(input);
    const pgn = game.toPGN();

    for (let i = 0; i < pgn.length; i += 15) {
      const actual = pgn.slice(i, i + 15);
      const expected = input.slice(i, i + 15);
      expect(actual).to.equal(expected);
    }
  });

  it("should handle annotations", () => {
    const game = ChessGame.fromPGN(`[Result "*"] 1.d4 e6 2.c4 Bb4 $5 3.Qd2 $4 Bxd2 $21 *`);
    expect(game.toPGN()).to.include("1.d4 e6 2.c4 Bb4+ $5 3.Qd2 $4 Bxd2+ $21");
  });

  it("should handle the null move", () => {
    const game = ChessGame.fromPGN(`[Result "*"] 1.--`);
    const m1 = game.currentPosition.findMoveByComputerNotation("e7e5")!;
    game.playMove(m1);
    const m2 = game.currentPosition.findMoveByComputerNotation("e2e4")!;
    game.playMove(m2);
    game.playNullMove();
    expect(game.toPGN()).to.include("1.-- e5 2.e4 --");
  });

  it("should account for pins", () => {
    const game = ChessGame.fromPGN(`[Result "*"] 1.d4 e6 2.Nc3 Bb4 3.e3 d5 4.Ne2 *`);
    const { board } = game.currentPosition;
    expect(board.has(SquareIndex.g1)).to.be.false;
    expect(board.get(SquareIndex.e2)).to.equal(Pieces.WHITE_KNIGHT);
    expect(board.get(SquareIndex.c3)).to.equal(Pieces.WHITE_KNIGHT);
  });
});

describe("Game splicing", () => {
  it("truncate previous moves", () => {
    const game = ChessGame.fromPGN(`[Result "*"] 1.e4 e5 2.Nf3 Nc6 *`);
    game.truncatePreviousMoves();
    expect(game.currentPosition.toFEN()).not.to.eq(Position.START_FEN);
    expect(game.currentPosition.toMoveString()).to.have.length(0);
  });

  it("truncate next moves", () => {
    const game = ChessGame.fromPGN(`[Result "*"] 1.e4 e5 2.Nf3 Nc6 *`);
    game.currentPosition = game.firstPosition.next[0].position;
    game.truncateFromCurrentPosition();
    expect(game.firstPosition.toMoveString()).to.eq("1.e4");
  });
});