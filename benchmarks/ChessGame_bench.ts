import { ChessGame } from "../mod.ts";

const longestHumanPGN = await Deno.readTextFile(`pgn-files/longest-human-game.pgn`);
const longestEnginePGN = await Deno.readTextFile(`pgn-files/long-engine-game1.pgn`);

Deno.bench("Parse long human game", () => {
  new ChessGame(longestHumanPGN);
});

Deno.bench("Parse long engine game", () => {
  new ChessGame(longestEnginePGN);
});

Deno.bench("Stringify long engine game", (b) => {
  const game = new ChessGame(longestEnginePGN);

  b.start();
  game.toPGN();
  b.end();
});