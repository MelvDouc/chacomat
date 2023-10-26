import { ChessGame, GameResults } from "../mod.ts";
import { assert, assertEquals, assertStringIncludes } from "./test.index.ts";

Deno.test("Parse game info.", () => {
  const { gameInfo } = ChessGame.parsePGN(`
    [Event "WCC"]
    [Site "Havana CUB"]
    [Round "1"]
    [Result "1-0"]

    1-0
  `);
  assertEquals(gameInfo.Event, "WCC");
  assertEquals(gameInfo.Site, "Havana CUB");
  assertEquals(Number(gameInfo.Round), 1);
  assertEquals(gameInfo.Result, GameResults.WHITE_WIN);
});

Deno.test("Parse various moves.", () => {
  const moveStr = "1.e4 ( 1.d4 d5 ( 1...Nf6 ) 2.c4 ( 2.Bg5 ) 2...c5 ) ( 1.c4 ) 1...Nc6 ( 1...d5 2.exd5 e5 3.dxe6 ) 2.Nf3 d6 3.Bc4 Bg4 4.0-0 Qd7 5.c3 0-0-0 *";
  const game = new ChessGame(`[Result "*"] ${moveStr} *`);
  const pgn = game.toPGN();
  assertStringIncludes(pgn, moveStr);
});

Deno.test("Parse variations.", () => {
  const moveStr = "1.d4 Nf6 2.c4 g6 3.Nc3 Bg7 4.e4 d6 5.Nf3 0-0 6.Be2 Nbd7 7.0-0 e5 8.Re1 Re8 9.Bf1 b6 10.Rb1 ( 10.d5 a5 11.Bd3 Nc5 12.Bc2 Bd7 ( 12...Bg4 13.a3 ) 13.Be3 Rf8 14.a3 Nh5 15.b4 Na6 16.Rb1 f5 17.exf5 gxf5 18.Ng5 Nf6 19.Ne6 Bxe6 20.dxe6 f4 21.Bxf4 Qe8 22.Bg5 Qxe6 23.Ne4 ) 10...Bb7 11.d5 a5 12.a3 Nh5 13.b4 axb4 14.axb4 Ba6 15.Bg5 f6 ( 15...Bf6 16.Be3 Nf4 ( 16...Be7 17.Ra1 ) 17.Qb3 ) ( 15...Qc8 16.Qc2 h6 17.Be3 Qd8 18.Nd2 ) 16.Be3 Qe7 17.Ra1 Qf7 18.Qd2 ( 18.Qa4 Bb7 19.Qc2 f5 20.Ng5 Qf6 21.exf5 gxf5 22.Ne6 ) 18...Bb7 19.Nb5 Nf8 20.c5 ( 20.Bxb6 cxb6 21.Nxd6 Qc7 22.Nxe8 Rxe8 23.Rec1 ) 20...bxc5 21.bxc5 Ba6 22.Nxd6 ( 22.cxd6 Bxb5 23.Bxb5 Rxa1 24.Rxa1 Rb8 25.Bc6 cxd6 26.Ra7 ) 22...cxd6 23.Bxa6 f5 24.Qc2 Nf4 25.Bc4 1-0";
  const game = new ChessGame(`[Result "1-0"] ${moveStr} 1-0`);
  const pgn = game.toPGN();
  assertStringIncludes(pgn, moveStr);
});

Deno.test("Parse long game back and forth.", async () => {
  const input = await Deno.readTextFile(`${Deno.cwd()}/pgn-files/long-engine-game1.pgn`);
  const game = new ChessGame(input);
  const pgn = game.toPGN();

  for (let i = 0; i < pgn.length; i++) {
    if (pgn[i] !== input[i]) {
      assert(false, `index: ${i}; input: "${input[i]}"; output: "${pgn[i]}"`);
    }
  }
});