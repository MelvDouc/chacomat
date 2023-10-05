import { fileExists } from "@dev_deps";
import { ChessGame } from "../mod.ts";

const pgnDir = "pgn-files";
const longestHumanPGN = await Deno.readTextFile(`${pgnDir}/longest-human-game.pgn`);
const longestEnginePGN = await Deno.readTextFile(`${pgnDir}/longest-engine-game.pgn`);

Deno.bench("Parse long human game", () => {
  new ChessGame({ pgn: longestHumanPGN });
});

Deno.bench("Parse long engine game", () => {
  new ChessGame({ pgn: longestEnginePGN });
});

Deno.bench("Stringify long engine game", async (b) => {
  const filePath = `${pgnDir}/long-engine-game1.pgn`;
  const filePath2 = filePath.replace(".pgn", "__stringified.pgn");
  const longEngineGame1 = await Deno.readTextFile(filePath);
  const game = new ChessGame({ pgn: longEngineGame1 });

  b.start();
  const pgn = game.toPGN();
  b.end();

  if (!(await fileExists(filePath2)))
    await Deno.writeTextFile(filePath2, pgn);
});