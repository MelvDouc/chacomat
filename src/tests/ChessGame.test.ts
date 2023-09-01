import Coords from "@constants/Coords.js";
import Piece from "@constants/Piece.js";
import ChessGame from "@game/ChessGame.js";
import Move from "@moves/Move.js";
import { strict, strictEqual } from "node:assert";
import { test } from "node:test";

test("entering moves #1", () => {
  const game = new ChessGame();
  game.playMove(new Move(Coords.get(6, 4), Coords.get(4, 4)));
  const { board } = game.currentPosition;

  strict(!board.has(Coords.get(6, 4)));
  strictEqual(board.get(Coords.get(4, 4)), Piece.WHITE_PAWN);
});

test("entering moves #2", () => {
  const game = new ChessGame();
  game
    .playMove(new Move(Coords.get(6, 4), Coords.get(4, 4)))
    .playMove(new Move(Coords.get(1, 3), Coords.get(3, 3)))
    .playMove(new Move(Coords.get(4, 4), Coords.get(3, 3)));
  const { board } = game.currentPosition;

  strict(!board.has(Coords.get(4, 4)));
  strictEqual(board.get(Coords.get(3, 3)), Piece.WHITE_PAWN);
});

test("entering moves via a PGN", () => {
  const game = new ChessGame({ pgn: `1. e4` });
  strictEqual(game.currentPosition.activeColor.abbreviation, "b");
});

test("PGN variations #1", () => {
  const game = new ChessGame({ pgn: `1. e4 e5 ( 1... c5 2. c3 ) 2. Nf3` });
  game.goToStart();

  strictEqual(game.currentPosition.next.length, 1);
  strictEqual(game.currentPosition.next[0].position.next.length, 2);
});

test("PGN variations #2", () => {
  const game = new ChessGame({ pgn: `1. Nf3 d5 2. g3 ( 2. d4 ) 2... Bg4 3. Bg2` });
  const prev = game.currentPosition.prev!;

  strictEqual(prev.next[0].move.getAlgebraicNotation(prev.board, prev.legalMoves), "Bg2");
});

test("PGN variations #3", () => {
  const game = new ChessGame({ pgn: `1. c4 e5 ( 1... c5 ) ( 1... Nf6 ) 2. Nc3 Nf6 3. g3 ( 3. Nf3 Nc6 ( 3... e4 4. Ng5 ) ) 3... g6` });
  const pgn = game.toString();

  strict(pgn.includes("( 3. Nf3 Nc6 ( 3... e4 4. Ng5 ) )"), pgn);
  strict(pgn.endsWith("3... g6 *"), pgn);
});

test("Real PGN #1", () => {
  const pgn = `
    [Event "FRA TCh-4 14/15"]
    [Site "Metz FRA"]
    [Date "2015.01.11"]
    [Round "4.4"]
    [White "me"]
    [Black "****"]
    [Result "1/2-1/2"]
    [WhiteElo "1630"]
    [BlackElo "1775"]
    [ECO "A43u"]
    [WhiteTeam "EFE Metz"]
    [BlackTeam "Pont-à-Mousson"]

    1.Nf3 Nf6 2.d4 c5 3.d5 d6 4.Nc3 g6 5.e4 Bg7 6.Nd2 Na6 7.Be2 Nc7 8.a4 a6 9.O-O Bd7 10.a5 Nb5 11.f3 Nh5 12.Ncb1 ( 12.Na4 Qxa5 13.Nc4 Qd8 14.Nab6 Rb8 15.f4 Nf6 16.e5 dxe5 17.fxe5 Ng8 18.Rxf7 Bxe5 19.Nxe5 Qxb6 20.Rf8+ ) 12...Nf4 13.c3 b6 14.Nc4 Nxe2+ 15.Qxe2 bxa5 16.Rxa5 O-O 17.Bg5 Re8 18.Rd1 h6 19.Bh4 g5 20.Bg3 e6 21.Ra1 exd5 22.Rxd5 Be6 23.Rd1 d5 24.exd5 Bxd5 25.Ne3 Nd4 26.cxd4 cxd4 27.Bf2 Qe7 28.Ra3 Bc6 29.Qc2 dxe3 30.Rxe3 Qb7 31.Rxe8+ Rxe8 32.Nc3 Rb8 33.Rd2 Be5 34.Re2 Qc7 35.h3 Kg7 36.Qd3 Bb5 37.Nxb5 Rxb5 38.Bd4 Qc1+ 39.Kf2 Qc7 40.Rxe5 1/2-1/2
  `;
  const game = new ChessGame({ pgn });

  strictEqual(game.metaData.White, "me");
});

test("go to start", () => {
  const game = new ChessGame();
  const firstPos = game.currentPosition;
  game
    .playMove(new Move(Coords.get(6, 4), Coords.get(4, 4)))
    .playMove(new Move(Coords.get(1, 3), Coords.get(3, 3)))
    .playMove(new Move(Coords.get(4, 4), Coords.get(3, 3)));
  game.goToStart();

  strictEqual(game.currentPosition, firstPos);
});