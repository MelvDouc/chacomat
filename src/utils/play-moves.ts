import Coords from "@/board/Coords.ts";
import PawnMove from "@/moves/PawnMove.ts";
import Piece from "@/pieces/Piece.ts";
import { ChacoMat } from "@/typings/chacomat.ts";
import {
  findClosingParenIndex,
  findNextBracketIndex
} from "@/utils/string-search.ts";

type HalfMoveGroupKey = "pi" | "sf" | "sr" | "dc" | "pr" | "o" | "o2";
type HalfMoveGroups = { [K in HalfMoveGroupKey]?: string };

const nonCastlingRegex = /(?<pi>[NBRQK])?(?<sf>[a-h])?(?<sr>[1-8])?x?(?<dc>[a-h][1-8])(=?(?<pr>[QRBN]))?/;
const castlingRegex = /(?<o>0|O)-\k<o>(?<o2>-\k<o>)?/;
const halfMoveRegex = RegExp(`(${nonCastlingRegex.source}|${castlingRegex.source})`, "g");

function findMove(position: ChacoMat.Position, { pi, sf, sr, dc, pr, o, o2 }: HalfMoveGroups) {
  if (o) {
    for (const castlingMove of position.castlingMoves())
      if (castlingMove.isQueenSide() === (o2 !== void 0))
        return castlingMove;

    return null;
  }

  const destCoords = Coords.fromNotation(dc as string);
  const piece = Piece.fromWhiteInitialAndColor(pi ?? "P", position.activeColor)!;

  for (const move of position.generateLegalMoves()) {
    if (
      move.srcPiece === piece
      && move.destCoords === destCoords
      && (!sf || move.srcCoords.fileName === sf)
      && (!sr || move.srcCoords.rankName === sr)
      && (!(move instanceof PawnMove) || !move.isPromotion() || move.promotedPiece?.whiteInitial === pr)
    ) {
      return move;
    }
  }

  return null;
}

export function playLine(line: string, game: ChacoMat.ChessGame) {
  for (const { 0: substring, groups } of line.matchAll(halfMoveRegex)) {
    const move = findMove(game.currentPosition, groups as HalfMoveGroups);
    if (!move)
      throw new Error(`Illegal move "${substring}" in "${line}".`);
    game.playMove(move);
  }
}

export default function playMoves(moveStr: string, game: ChacoMat.ChessGame) {
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