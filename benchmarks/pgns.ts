const longestHumanPGN = await Deno.readTextFile(`pgn-files/longest-human-game.pgn`);
const longestEnginePGN = await Deno.readTextFile(`pgn-files/long-engine-game1.pgn`);

export {
  longestEnginePGN,
  longestHumanPGN
};
