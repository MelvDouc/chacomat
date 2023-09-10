import ChessGame from "@/standard/ChessGame.ts";

Deno.bench("Parse long game #1", async (b) => {
  const pgn = await Deno.readTextFile("pgn-files/nikolic_arsovic_1989.pgn");
  b.start();
  new ChessGame({ pgn });
  b.end();
});

Deno.bench("Parse long game #2", async (b) => {
  const pgn = await Deno.readTextFile("pgn-files/petrosian_milanovic_2005.pgn");
  b.start();
  new ChessGame({ pgn });
  b.end();
});

Deno.bench("Parse marathon engine game", async (b) => {
  const pgn = await Deno.readTextFile("pgn-files/defenchess_demolito_2019.pgn");
  b.start();
  const game = new ChessGame({ pgn });
  b.end();
  Deno.writeTextFile("pgn-files/stringified/defenchess_demolito_2019.pgn", game.toString());
});

Deno.bench("Stringify long game", async (b) => {
  const game = new ChessGame({ pgn: await Deno.readTextFile("pgn-files/nikolic_arsovic_1989.pgn") });
  b.start();
  const pgn = game.toString();
  b.end();
  Deno.writeTextFile("pgn-files/stringified/nikolic_arsovic_1989.pgn", pgn);
});