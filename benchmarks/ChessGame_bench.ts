import ChessGame from "@/standard/ChessGame.ts";

const pgn1 = await Deno.readTextFile("pgn-files/nikolic_arsovic_1989.pgn");
const pgn2 = await Deno.readTextFile("pgn-files/petrosian_milanovic_2005.pgn");
const pgn3 = await Deno.readTextFile("pgn-files/defenchess_demolito_2019.pgn");

Deno.bench("Parse long game #1", () => {
  new ChessGame({ pgn: pgn1 });
});

Deno.bench("Parse long game #2", () => {
  new ChessGame({ pgn: pgn2 });
});

Deno.bench("Parse marathon engine game", () => {
  new ChessGame({ pgn: pgn3 });
});

Deno.bench("Stringify long game", (b) => {
  const game = new ChessGame({ pgn: pgn1 });
  b.start();
  game.toString();
  b.end();
});