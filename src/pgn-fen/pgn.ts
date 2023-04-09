import Colors from "@src/constants/Colors.js";
import { coordsToNotation } from "@src/constants/Coords.js";
import Piece, { PieceAbbreviations } from "@src/constants/Piece.js";
import ChessGame from "@src/game/ChessGame.js";
import Position from "@src/game/Position.js";
import getHalfMove from "@src/pgn-fen/half-move.js";
import { GameMetaInfo } from "@src/types.js";

const infoRegex = /^\[(?<k>\w+)\s+"(?<v>[^"]*)"\]/;
const halfMoveRegex = /([NBRQK][a-h]?[1-8]?x?[a-h][1-8]|[a-h](x[a-h])?[1-8](=?[NBRQ])?|O-O(-O)?|0-0(-0)?)/g;

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
      for (const [halfMoveStr] of movesStr.matchAll(halfMoveRegex)) {
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

function halfMoveToNotation(srcPosition: Position, varIndex = 0): string {
  const { pieces, activeColor, inactiveColor, next } = srcPosition;
  const [srcCoords, destCoords, promotedPiece] = next[varIndex].srcMove;
  const srcPiece = pieces[activeColor].get(srcCoords) as Piece;
  const destNotation = coordsToNotation(destCoords);

  if (srcPiece < Piece.KNIGHT) {
    if (srcCoords.y !== destCoords.y)
      return `${coordsToNotation(srcCoords)[0]}x${destNotation + (PieceAbbreviations[promotedPiece] ?? "")}`;
    return destNotation + (PieceAbbreviations[promotedPiece] ?? "");
  }

  if (srcPiece === Piece.KING) {
    if ((Math.abs(destCoords.y - srcCoords.y) === 2 || pieces[activeColor].get(destCoords) === Piece.ROOK))
      return (Math.sign(destCoords.y - srcCoords.y) === -1) ? "0-0-0" : "0-0";
    return `K${(pieces[inactiveColor].has(destCoords) ? "x" : "") + destNotation}`;
  }

  let ambiguousRank = "",
    ambiguousFile = "";

  for (const [src, dest] of srcPosition.getHalfMoves()) {
    if (ambiguousFile && ambiguousRank)
      break;
    if (dest === destCoords && src !== srcCoords && pieces[activeColor].get(src) === srcPiece) {
      if (!ambiguousFile && src.y === srcCoords.y)
        ambiguousFile = coordsToNotation(srcCoords)[0];
      if (!ambiguousRank && src.x === srcCoords.x)
        ambiguousRank = coordsToNotation(srcCoords)[1];
    }
  }

  return PieceAbbreviations[srcPiece] + ambiguousFile + ambiguousRank + (pieces[inactiveColor].has(destCoords) ? "x" : "") + destNotation;
}