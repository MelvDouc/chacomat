import { GameMetaInfo } from "@chacomat/types.js";

const metaInfoRegex = /\s*\[(\w+) "([^"]*)"\]\s*/g;

function getMetaInfo(pgn: string): GameMetaInfo {
  const metaInfo = {} as GameMetaInfo;

  for (const [, prop, value] of pgn.matchAll(metaInfoRegex))
    metaInfo[prop] = value;

  return metaInfo;
}

export default getMetaInfo;