import { ChessGame } from "../mod.ts";
import { longestEnginePGN, longestHumanPGN } from "./pgns.ts";

let longestHumanGame: ChessGame;
let longestEngineGame: ChessGame;

Deno.bench("Parse long human game", () => {
  longestHumanGame = new ChessGame(longestHumanPGN);
});

Deno.bench("Parse long engine game", () => {
  longestEngineGame = new ChessGame(longestEnginePGN);
});

Deno.bench("Stringify long human game", (b) => {
  longestHumanGame = new ChessGame(longestHumanPGN);

  b.start();
  longestHumanGame.toPGN();
  b.end();
});

Deno.bench("Stringify long engine game", (b) => {
  longestEngineGame = new ChessGame(longestEnginePGN);

  b.start();
  longestEngineGame.toPGN();
  b.end();
});