import pgn from "$pgn-files/long-engine-game1.pgn";
import ChessGame from "$src/game/ChessGame";
import { bench, run } from "mitata";

let game: ChessGame;

bench("Parse long game.", () => {
  game = ChessGame.fromPGN(pgn);
  game.currentPosition;
});

bench("Stringify long game", () => {
  game.toPGN();
});

await run();