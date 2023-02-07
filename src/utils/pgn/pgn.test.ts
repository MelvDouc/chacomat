import ChessGame from "@chacomat/game/ChessGame.js";
import { notationToIndex } from "@chacomat/utils/Index.js";
import { playMovesFromPgn } from "@chacomat/utils/pgn/moves.js";

const b2 = notationToIndex("b2");
const d1 = notationToIndex("d1");
const d4 = notationToIndex("d4");
const d6 = notationToIndex("d6");
const e6 = notationToIndex("e6");
const f6 = notationToIndex("f6");
const g4 = notationToIndex("g4");
const g6 = notationToIndex("g6");
const h7 = notationToIndex("h7");

describe("PNG reader", () => {
  it("should be able to handle the first few moves", () => {
    const game = new ChessGame();
    playMovesFromPgn("1. e4 e5 2. Nf3 Nc6", game);

    expect(game.currentPosition.toString()).toBe("r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3");
  });

  it("should be able to handle a move with no black half-move", () => {
    const game = new ChessGame();
    playMovesFromPgn("1. Nc3 e6 2. e4 d5 3. exd5", game);

    expect(game.currentPosition.toString()).toBe("rnbqkbnr/ppp2ppp/4p3/3P4/8/2N5/PPPP1PPP/R1BQKBNR b KQkq - 0 3");
  });

  it("should work with an ongoing game", () => {
    const game = new ChessGame();
    game
      .moveWithNotations("c2", "c4")
      .moveWithNotations("b7", "b6")
      .moveWithNotations("e2", "e4")
      .moveWithNotations("c8", "b7");

    playMovesFromPgn("3. Bd3 4. e5 Nf3 5. Bc5", game);

    expect(game.currentPosition.toString()).toBe("rn1qk1nr/pbpp1ppp/1p6/2b1p3/2P1P3/3B1N2/PP1P1PPP/RNBQK2R w KQkq - 2 5");
  });

  it("should be able to parse PGN info", () => {
    const game = new ChessGame({
      pgn: `[Event "N3 2022-23"]
      [Site "Thionville FRA"]
      [Date "2023.01.15"]
      [Round "5.3"]
      [White "Espinosa, Enrique"]
      [Black "Doucet, Melvin"]
      [Result "0-1"]
      [WhiteElo "1952"]
      [BlackElo "1985"]
      [ECO "D00c"]
      [TimeControl "5400/40+30:1800+30"]
      [WhiteTeam "Seichamps"]
      [BlackTeam "Thionville"]

      1.d4 d5 2.Bf4 Nf6 3.e3 Bg4 4.f3 Bd7 5.c4 c5 6.Nc3 e6 7.Nh3 Nc6 8.Be5 cxd4 9.exd4 dxc4 10.Bxc4 Rc8 11.Qe2 Be7 12.Bxf6 Bxf6 13.d5 Nd4 14.Qd3 Rxc4 15.Qxc4 Nc2+ 16.Ke2 Nxa1 17.Rxa1 exd5 18.Nxd5 0-0 19.Nhf4 Bxb2 20.Rb1 Qe8+ 21.Kf2 Qe5 22.Kf1 Bc6 (22... Kh8) 23.Ne7+ Qxe7 24.Rxb2 Qh4 25.g3 Qf6 26.Rf2 Rd8 27.Qc5 a6 28.Qe3 Qa1+ 29.Kg2 Qd1 30.h4 Re8 31.Qc3 Re1 32.h5 Rg1+ 33.Kh3 Bd7+ 34.g4 Rh1+ 35.Rh2 Bc6 36.Rxh1 Qxh1+ 37.Kg3 h6 38.Qd3 Qe1+ 39.Kg2 Qa5 40.a3 Qc7 41.Qd4 Qe7 42.Qc3 Qh4 43.Kf1 Qg3 44.Nd5 Bb5+`
    });

    expect(game.metaInfo.Black).toBe("Doucet, Melvin");
    expect(game.metaInfo.BlackElo).toBe(1985);
    expect(game.metaInfo.Round).toBeCloseTo(5.3);
    expect(game.currentPosition.legalMoves).toHaveLength(2);

    console.log(game.metaInfo);
    game.logBoard();
  });
});

describe("An ambiguous move", () => {
  const getGame = () => new ChessGame({
    fen: "k7/7Q/3R1R2/8/6Q1/8/6K1/3R4 w - - 0 1"
  });

  it("should be detected on an ambiguous file", () => {
    const game = getGame();
    playMovesFromPgn("1. R6d4", game);
    const { board } = game.currentPosition;

    expect(board.get(d6)).toBeFalsy();
    expect(board.get(d4)?.isRook()).toBe(true);
    expect(board.get(d4)?.#color).toBe("WHITE");
    expect(board.get(d1)?.isRook()).toBe(true);
    expect(board.get(d1)?.#color).toBe("WHITE");
  });

  it("should be detected on an ambiguous rank", () => {
    const game = getGame();
    playMovesFromPgn("1. Rfe6", game);
    const { board } = game.currentPosition;

    expect(board.get(f6)).toBeFalsy();
    expect(board.get(e6)?.isRook()).toBe(true);
    expect(board.get(e6)?.#color).toBe("WHITE");
    expect(board.get(d6)?.isRook()).toBe(true);
    expect(board.get(d6)?.#color).toBe("WHITE");
  });

  it("should be detected on an ambiguous square", () => {
    const game = getGame();
    playMovesFromPgn("1. Qh7g6", game);
    const { board } = game.currentPosition;

    expect(board.get(h7)).toBeFalsy();
    expect(board.get(g6)?.isQueen()).toBe(true);
    expect(board.get(g6)?.#color).toBe("WHITE");
    expect(board.get(g4)?.isQueen()).toBe(true);
    expect(board.get(g4)?.#color).toBe("WHITE");
  });
});

describe("Castling", () => {
  it("should work on both sides", () => {
    const game = new ChessGame({ fen: "4k2r/8/8/8/8/8/8/R3K3 w Qk - 0 1" });

    expect(() => playMovesFromPgn("1. 0-0-0 0-0", game)).not.toThrowError();
  });

  it("should work on the queen side with a black rook on b2", () => {
    const game = new ChessGame({ fen: "3k4/8/8/8/8/8/1r6/R3K3 w Q - 0 1" });
    playMovesFromPgn("1. 0-0-0 Ke7 2. Kxb2", game);

    expect(game.currentPosition.isCheck()).toBe(false);
    expect(game.currentPosition.board.get(b2)?.isKing()).toBe(true);
    expect(game.currentPosition.board.getNonKingPiecesByColor()["BLACK"].length).toBe(0);
  });
});