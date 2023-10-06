import ChessGame from "@/game/ChessGame.ts";
import { assert, assertEquals } from "@dev_deps";

Deno.test("handle variations", async () => {
  const pgn1 = await Deno.readTextFile("pgn-files/online-game.pgn");
  const actualOpeningParenCount = [...pgn1].filter(c => c === "(").length;
  const game = new ChessGame(pgn1);
  const gameStr = game.toPGN();
  const openingParenCount = [...gameStr].filter(c => c === "(").length;
  assertEquals(openingParenCount, actualOpeningParenCount, gameStr);
});

Deno.test("dots in PGN", () => {
  const game = new ChessGame(`
  [Result "0-1"]

  1.c4 e6 2.Nc3 d5 3.d4 c6 4.Bf4 dxc4 5.e4 b5 6.Nf3 Bb4 ( 6...Nf6 7.Bg5 h6 8.Bh4 Be7 9.Qc2 Nbd7 10.O-O-O Bb7 11.Be2 O-O ) 7.Qc2 Nf6 8.Rd1 Nbd7 9.a3 Be7 10.d5 exd5 11.exd5 Nxd5 12.Nxd5 cxd5 13.Rxd5 Qa5+ ( 13...a6 14.Qd2 Bb7 15.Rd4 Bf6 16.Qe2+ Qe7 17.Qxe7+ Bxe7 ) 14.Bd2 Qb6 15.Be3 Qc6 16.Rh5 a6 17.Rxh7 Rxh7 18.Qxh7 Bf6 19.Ng5 Nf8 20.Qg8 Bxg5 21.Bxg5 Qe4+ 22.Be3 Qb1+ 23.Ke2 Bg4+ 24.f3 Qxb2+ 25.Ke1 Bf5 26.Be2 Qa1+ 27.Bd1 O-O-O 28.Qxf7 Qxd1+ 29.Kf2 Qxh1 30.Qa7 ( 30.Qxf5+ Nd7 31.Qe6 Rf8 32.Qc6+ Kd8 33.Bb6+ Ke7 34.Bc5+ Nxc5 35.Qxc5+ Kf7 36.Qf5+ Kg8 37.Qe6+ ) 30...Rd1 31.Qxa6+ Kd8 32.Qb6+ Ke7 33.Bg5+ Kf7 34.Qc7+ Kg8 35.Qe5 Qg1+ 0-1
  `);
  const pgn = game.toPGN();
  assert(pgn.includes("Bb4 ( 6...Nf6"));
  assert(pgn.includes("37.Qe6+ ) 30...Rd1"));
});