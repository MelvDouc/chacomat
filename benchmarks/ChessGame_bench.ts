import { ChessGame } from "../mod.ts";

const pgn1 = await Deno.readTextFile("pgn-files/bright0.2c_glaurung2.0.1_2007.pgn");
const pgn2 = await Deno.readTextFile("pgn-files/stockfish_Lc0_2020.pgn");
const pgn3 = await Deno.readTextFile("pgn-files/defenchess_demolito_2019.pgn");

Deno.bench("Parse long game", () => {
  new ChessGame({ pgn: pgn1 });
});

Deno.bench("Parse longer game", () => {
  new ChessGame({ pgn: pgn2 });
});

Deno.bench("Parse longest game", () => {
  new ChessGame({ pgn: pgn3 });
});

Deno.bench("Stringify long game", (b) => {
  const game = new ChessGame({ pgn: pgn3 });
  b.start();
  game.toString();
  b.end();
});