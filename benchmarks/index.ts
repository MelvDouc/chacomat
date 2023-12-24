import { ChessGame } from "$src/index.js";
import { readFile } from "node:fs/promises";
import { bench, run } from "mitata";

const pgn1 = await readFile(`${process.cwd()}/pgn-files/long-engine-game1.pgn`, "utf-8");
let game: ChessGame;

bench("Parse long game.", () => {
  game = ChessGame.fromPGN(pgn1);
  game.currentPosition;
});

bench("Stringify long game", () => {
  game.toPGN();
});

await run();