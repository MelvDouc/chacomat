import Coords from "@/board/Coords.ts";
import CastlingMove from "@/moves/CastlingMove.ts";
import PawnMove from "@/moves/PawnMove.ts";
import { ChacoMat } from "@/typings/chacomat.ts";
import {
  findClosingParenIndex,
  findNextBracketIndex
} from "@/utils/string-search.ts";

const halfMoveRegex = /([NBRQK]?[a-h]?[1-8]?x?[a-h][1-8]|(?<o>0|O)(-\k<o>){1,2})/g;

const moveMatchers: {
  regex: RegExp;
  find: (groups: Record<string, string>, position: ChacoMat.Position) => ChacoMat.Move | null | undefined;
}[] = [
    {
      regex: /(?<initial>[NBRQK])(?<srcFile>[a-h])?(?<srcRank>[1-8])?x?(?<destNotation>[a-h][1-8])/,
      find: ({ initial, srcFile, srcRank, destNotation }, { board, legalMoves }) => {
        const destCoords = Coords.fromNotation(destNotation);

        return legalMoves.find((move) => {
          return move.destCoords === destCoords
            && board.get(move.srcCoords)?.whiteInitial === initial
            && (!srcRank || move.srcCoords.rankName === srcRank)
            && (!srcFile || move.srcCoords.fileName === srcFile);
        });
      }
    },
    {
      regex: /((?<srcFile>[a-h])x)?(?<destNotation>[a-h][1-8])(?<promotion>=?[QRBN])?/,
      find: ({ srcFile, destNotation, promotion }, { board, legalMoves }) => {
        const destCoords = Coords.fromNotation(destNotation);

        return legalMoves.find((move) => {
          return move.destCoords === destCoords
            && board.get(move.srcCoords)?.isPawn()
            && (!srcFile || move.srcCoords.fileName === srcFile)
            && (!promotion || move instanceof PawnMove && move.promotedPiece?.whiteInitial === promotion);
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
  for (const { 0: substring, index } of line.matchAll(halfMoveRegex)) {
    const move = findMove(substring, game.currentPosition);
    if (!move) throw new Error(`Illegal move "${substring}" at index ${index} in "${line}".`);
    game.playMove(move);
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
      const closingIndex = moveStr.indexOf("}");
      game.currentPosition.comment = moveStr.slice(1, closingIndex).trim();
      moveStr = moveStr.slice(closingIndex + 1);
      continue;
    }

    const nextIndex = findNextBracketIndex(moveStr);
    playLine(moveStr.slice(0, nextIndex), game);
    moveStr = moveStr.slice(nextIndex);
  }
}

export default playMoves;