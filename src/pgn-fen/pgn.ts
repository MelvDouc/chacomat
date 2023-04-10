import Colors from "@src/constants/Colors.js";
import ChessGame from "@src/game/ChessGame.js";
import Position from "@src/game/Position.js";
import getHalfMove, { halfMoveToNotation } from "@src/pgn-fen/half-move.js";
import parseVariations from "@src/pgn-fen/parse-variations.js";
import { GameMetaInfo } from "@src/types.js";

const infoRegex = /^\[(?<k>\w+)\s+"(?<v>[^"]*)"\]/;
const halfMoveRegex = /([NBRQK][a-h]?[1-8]?x?[a-h][1-8]|[a-h](x[a-h])?[1-8](=?[NBRQ])?|O-O(-O)?|0-0(-0)?)/g;

// ===== ===== ===== ===== =====
// PARSE
// ===== ===== ===== ===== =====

function getGameMetaInfoAndMovesStr(pgn: string): {
  gameMetaInfo: Partial<GameMetaInfo>;
  movesStr: string;
} {
  const gameMetaInfo = {} as Partial<GameMetaInfo>;
  let matchArr: RegExpMatchArray | null;
  pgn = pgn.trimStart();

  while ((matchArr = pgn.match(infoRegex))?.groups) {
    gameMetaInfo[matchArr.groups["k"]] = matchArr.groups["v"];
    pgn = pgn.slice(matchArr[0].length).trimStart();
  }

  return {
    gameMetaInfo,
    movesStr: pgn
  };
}

// TODO: play variations
export function enterPgn(pgn: string) {
  const { movesStr, gameMetaInfo } = getGameMetaInfoAndMovesStr(pgn);

  return {
    gameMetaInfo,
    enterMoves: (game: ChessGame) => {
      const mainLine = parseVariations(movesStr).mainLine;
      for (const [halfMoveStr] of mainLine.matchAll(halfMoveRegex)) {
        const halfMove = getHalfMove(halfMoveStr, game.getCurrentPosition());
        if (!halfMove)
          throw new Error(`Invalid move: "${halfMoveStr}".`);
        game.playMove(...halfMove);
      }
    }
  };
}

// ===== ===== ===== ===== =====
// STRINGIFY
// ===== ===== ===== ===== =====

export function getPgnFromGame(game: ChessGame): string {
  let position: Position | undefined = game.getFirstPosition();
  let pgn = "";

  for (const key in game.metaInfo) {
    pgn += `[${key} "${game.metaInfo[key]}"]`;
  }

  while (position?.next[0]) {
    if (position.activeColor === Colors.WHITE)
      pgn += ` ${position.fullMoveNumber}.`;
    pgn += ` ${halfMoveToNotation(position)}`;
    position = position.next[0];
  }

  return `${pgn} ${game.getResult()}`;
}