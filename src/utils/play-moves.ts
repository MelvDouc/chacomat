import Coords from "@/board/Coords.ts";
import CastlingMove from "@/moves/CastlingMove.ts";
import { ChacoMat } from "@/typings/chacomat.ts";
import {
  findClosingCurlyIndex,
  findClosingParenIndex,
  findNextBracketIndex
} from "@/utils/string-search.ts";

interface MoveMatcher {
  regex: RegExp;
  find: (groups: Record<string, string>, position: ChacoMat.Position) => ChacoMat.Move | null | undefined;
}

const moveMatchers: MoveMatcher[] = [
  {
    regex: /(?<p>[NBRQK])(?<srcFile>[a-h])?(?<srcRank>[1-8])?x?(?<destNotation>[a-h][1-8])/,
    find: ({ p, srcFile, srcRank, destNotation }, { board, legalMoves }) => {
      const destCoords = Coords.fromNotation(destNotation);

      return legalMoves.find((move) => {
        return move.destCoords === destCoords
          && board.get(move.srcCoords)?.whiteInitial === p
          && (!srcRank || move.srcCoords.rankName === srcRank)
          && (!srcFile || move.srcCoords.fileName === srcFile);
      });
    }
  },
  {
    regex: /((?<srcFile>[a-h])x)?(?<destNotation>[a-h][1-8])(=?[QRBN])?/,
    find: ({ srcFile, destNotation }, { board, legalMoves }) => {
      const destCoords = Coords.fromNotation(destNotation);

      return legalMoves.find((move) => {
        return move.destCoords === destCoords
          && board.get(move.srcCoords)?.isPawn()
          && (!srcFile || move.srcCoords.fileName === srcFile);
      });
    }
  },
  {
    regex: /(?<o>0|O)-\k<o>(?<o2>-\k<o>)?/,
    find: ({ o2 }, { legalMoves }) => {
      for (let i = 1; i <= 2; i++) {
        const move = legalMoves[legalMoves.length - i];
        if (move instanceof CastlingMove && move.isQueenSide() === (o2 !== undefined))
          return move;
      }

      return null;
    }
  }
];

function findMove(input: string, position: ChacoMat.Position) {
  for (const { regex, find } of moveMatchers) {
    const matches = input.match(regex);

    if (matches)
      return find(matches.groups!, position);
  }

  return null;
}

function playLine(line: string, game: ChacoMat.ChessGame) {
  for (const substring of line.trim().split(/\s+/)) {
    const move = findMove(substring, game.currentPosition);
    if (move) game.playMove(move);
  }
}

function playMoves(moveStr: string, game: ChacoMat.ChessGame) {
  while (moveStr.length) {
    if (moveStr[0] === "(") {
      const closingIndex = findClosingParenIndex(moveStr, 0);
      const { currentPosition } = game;
      game.goBack();
      playMoves(moveStr.slice(1, closingIndex), game);
      game.currentPosition = currentPosition;
      moveStr = moveStr.slice(closingIndex + 1);
      continue;
    }

    if (moveStr[0] === "{") {
      const closingIndex = findClosingCurlyIndex(moveStr, 0);
      game.currentPosition.comment = moveStr.slice(1, closingIndex);
      moveStr = moveStr.slice(closingIndex + 1);
      continue;
    }

    const nextIndex = findNextBracketIndex(moveStr);
    playLine(moveStr.slice(0, nextIndex), game);
    moveStr = moveStr.slice(nextIndex);
  }
}

export default playMoves;