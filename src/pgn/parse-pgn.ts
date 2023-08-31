import type ChessGame from "@game/ChessGame.js";
import playMoves from "./play-moves.js";

const infoRegex = /\[(?<key>\w+)\s+"(?<value>[^"]*)"\]/;

export default function parsePgn(pgn: string) {
  let matchArray: RegExpMatchArray | null;
  const metaData: Record<string, string> = {};

  while ((matchArray = pgn.match(infoRegex)) !== null && matchArray.groups) {
    metaData[matchArray.groups["key"]] = matchArray.groups["value"];
    pgn = pgn.slice(matchArray[0].length).trim();
  }

  return {
    metaData,
    enterMoves: (game: ChessGame) => playMoves(pgn, game)
  };
}