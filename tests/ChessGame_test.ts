import { assert, assertArrayIncludes, assertEquals, assertFalse } from "$dev_deps";
import ChessGame from "@/impl/ChessGame.ts";
import Piece from "@/impl/Piece.ts";
import PawnMove from "@/impl/moves/PawnMove.ts";

const { Pieces } = Piece;

Deno.test("entering moves #1", () => {
  const game = new ChessGame();
  game.playMove(new PawnMove(game.currentPosition.board.Coords(6, 4), game.currentPosition.board.Coords(4, 4)));
  const { board } = game.currentPosition;

  assertFalse(board.has(6, 4));
  assertEquals(board.get(4, 4), Pieces.WHITE_PAWN);
});

Deno.test("entering moves #2", () => {
  const game = new ChessGame();
  const { Coords } = game.currentPosition.board;
  game
    .playMove(new PawnMove(Coords(6, 4), Coords(4, 4)))
    .playMove(new PawnMove(Coords(1, 3), Coords(3, 3)))
    .playMove(new PawnMove(Coords(4, 4), Coords(3, 3)));
  const { board } = game.currentPosition;

  assert(!board.has(4, 4));
  assertEquals(board.get(3, 3), Pieces.WHITE_PAWN);
});

Deno.test("entering moves via a PGN", () => {
  const game = new ChessGame({ pgn: `1. e4` });
  assertEquals(game.currentPosition.activeColor.abbreviation, "b");
});

Deno.test("PGN variations #1", () => {
  const game = new ChessGame({ pgn: `1.e4 e5 ( 1...c5 2.c3 ) 2.Nf3` });
  game.goToStart();

  assertEquals(game.currentPosition.next.length, 1);
  assertEquals(game.currentPosition.next[0][1].next.length, 2);
});

Deno.test("PGN variations #2", () => {
  const game = new ChessGame({ pgn: `1.Nf3 d5 2.g3 ( 2.d4 ) 2...Bg4 3.Bg2` });
  const prev = game.currentPosition.prev!;

  assertEquals(prev.next[0][0].getAlgebraicNotation(prev.board, prev.legalMoves), "Bg2");
});

Deno.test("PGN variations #3", () => {
  const game = new ChessGame({ pgn: `1.c4 e5 ( 1...c5 ) ( 1...Nf6 ) 2.Nc3 Nf6 3.g3 ( 3.Nf3 Nc6 ( 3...e4 4.Ng5 ) ) 3...g6` });
  const pgn = game.toString();

  assert(pgn.includes("( 3.Nf3 Nc6 ( 3...e4 4.Ng5 ) )"), pgn);
  assert(pgn.endsWith("3...g6 *"), pgn);
});

Deno.test("Real PGN #1", () => {
  const moveList = `1.Nf3 Nf6 2.d4 c5 3.d5 d6 4.Nc3 g6 5.e4 Bg7 6.Nd2 Na6 7.Be2 Nc7 8.a4 a6 9.0-0 Bd7 10.a5 Nb5 11.f3 Nh5 12.Ncb1 ( 12.Na4 Qxa5 13.Nc4 Qd8 14.Nab6 Rb8 15.f4 Nf6 16.e5 dxe5 17.fxe5 Ng8 18.Rxf7 Bxe5 19.Nxe5 Qxb6 20.Rf8+ ) 12...Nf4 13.c3 b6 14.Nc4 Nxe2+ 15.Qxe2 bxa5 16.Rxa5 0-0 17.Bg5 Re8 18.Rd1 h6 19.Bh4 g5 20.Bg3 e6 21.Ra1 exd5 22.Rxd5 Be6 23.Rd1 d5 24.exd5 Bxd5 25.Ne3 Nd4 26.cxd4 cxd4 27.Bf2 Qe7 28.Ra3 Bc6 29.Qc2 dxe3 30.Rxe3 Qb7 31.Rxe8+ Rxe8 32.Nc3 Rb8 33.Rd2 Be5 34.Re2 Qc7 35.h3 Kg7 36.Qd3 Bb5 37.Nxb5 Rxb5 38.Bd4 Qc1+ 39.Kf2 Qc7 40.Rxe5 1/2-1/2`;
  const game = new ChessGame({
    pgn: `
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

    ${moveList}`
  });
  const pgn = game.toString();

  assertEquals(game.metaData.White, "me");
  assert(pgn.includes(moveList), pgn);
});

Deno.test("Real PGN #2", () => {
  const game = new ChessGame({ pgn: `1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 O-O 6.Be2 Nbd7 7.O-O e5 8.Re1 Re8 9.Bf1 h6 10.d5 Nh7 11.Rb1 f5 12.Nd2 f4 13.b4 g5 14.Nb3 Bf8 15.Be2 Ndf6 16.c5 g4 17.cxd6 cxd6 18.a3 Ng5 19.Bf1 Re7 20.Qd3 Rg7 21.Kh1 Qe8 22.Nd2 g3 23.fxg3 fxg3 24.Qxg3 Nh3 25.Qf3 Qg6 26.Nc4 Bd7 27.Bd3 Ng5 28.Bxg5 Qxg5 9.Ne3 Re8 30.Ne2 Be7 31.Rbd1 Rf8 32.Nf5 Ng4 33.Neg3 h5 34.Kg1 h4 35.Qxg4 Qxg4 36.Nh6+ Kh7 37.Nxg4 hxg3 38.Ne3 gxh2+` });
  assertArrayIncludes(game.currentPosition.legalMovesAsAlgebraicNotation, ["Kxh2"]);
});

Deno.test("go to start", () => {
  const game = new ChessGame();
  const firstPos = game.currentPosition;
  const { Coords } = firstPos.board;
  game
    .playMove(new PawnMove(Coords(6, 4), Coords(4, 4)))
    .playMove(new PawnMove(Coords(1, 3), Coords(3, 3)))
    .playMove(new PawnMove(Coords(4, 4), Coords(3, 3)));
  game.goToStart();

  assertEquals(game.currentPosition, firstPos);
});