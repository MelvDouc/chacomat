import ChessGame from "@/game/ChessGame.ts";

Deno.bench("Parse long game #1", async (b) => {
  const pgn = await Deno.readTextFile("pgn-files/longest-game.pgn");
  const game = new ChessGame();
  b.start();
  game.enterPgn(pgn);
  b.end();
});

Deno.bench("Parse long game #2", async (b) => {
  const pgn = await Deno.readTextFile("pgn-files/longest-game2.pgn");
  b.start();
  new ChessGame({ pgn });
  b.end();
});

Deno.bench("Stringify long game", async (b) => {
  const game = new ChessGame({ pgn: await Deno.readTextFile("pgn-files/longest-game.pgn") });
  b.start();
  const pgn = game.toString();
  b.end();
  Deno.writeTextFile("pgn-files/longest-game_stringified.pgn", pgn);
});