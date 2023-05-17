import Colors from "@src/constants/Colors.js";
import GameStatus from "@src/constants/GameStatus.js";
import ChessGame from "@src/game/ChessGame.js";
import Position from "@src/game/Position.js";
import getHalfMove, { halfMoveToNotation } from "@src/pgn-fen/half-move.js";
import parseVariations from "@src/pgn-fen/parse-variations.js";
import { GameMetaInfo, HalfMoveWithPromotion } from "@src/types.js";

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
        const halfMove = getHalfMove(halfMoveStr, game.currentPosition);
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

export function stringifyMetaInfo(metaInfo: ChessGame["metaInfo"]): string {
  return Object.entries(metaInfo)
    .map(([key, value]) => `[${key} "${value}"]`)
    .join("\n");
}

export function stringifyMoves(game: ChessGame): string {
  let position: Position | undefined = game.getFirstPosition();
  let movesStr = "";

  while (position.next) {
    if (position.activeColor === Colors.WHITE)
      movesStr += `${position.fullMoveNumber}. `;

    movesStr += `${halfMoveToNotation(position, position.next.srcMove as HalfMoveWithPromotion)} `;
    if (position.next.getStatus() === GameStatus.CHECKMATE)
      movesStr += "#";
    else if (position.next.isCheck())
      movesStr += "+";
    position = position.next;
  }

  return movesStr;
}