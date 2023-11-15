import ChessGame from "$src/game/ChessGame.ts";
import { bench, run } from "mitata";

const pgn = await Bun.file(`${process.cwd()}/pgn-files/long-engine-game1.pgn`).text();
let game: ChessGame;

bench("Parse long game.", () => {
  game = ChessGame.fromPGN(pgn);
  game.currentPosition;
});

bench("Stringify long game", () => {
  game.toPGN();
});

await run();