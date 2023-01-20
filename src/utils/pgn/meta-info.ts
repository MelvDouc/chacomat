import { GameMetaInfo } from "@chacomat/types.js";

const pgnInfoRegex = /^\[(?<k>\w+) "(?<v>[^"]*)"\]$/;

function getMetaInfo(pgn: string): {
  pgnInfo: GameMetaInfo;
  movesStr: string;
} {
  const lines = pgn.split("\n");
  const pgnInfo = {} as GameMetaInfo;
  let linesLength = 0;

  for (const line of lines) {
    const match = line.trim().match(pgnInfoRegex);
    linesLength += (line.length + 1);
    if (!match) break;
    const { k, v } = match.groups;
    pgnInfo[k] = !isNumeric(v) ? v : parseFloat(v);
  }

  return {
    pgnInfo,
    movesStr: pgn.slice(linesLength + 1).trim()
  };
}

function isNumeric(str: string) {
  return !isNaN(parseFloat(str));
}

export default getMetaInfo;