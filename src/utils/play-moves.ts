import Coords from "@/coordinates/Coords.ts";
import PawnMove from "@/moves/PawnMove.ts";
import Piece from "@/pieces/Piece.ts";
import { ChacoMat } from "@/typings/chacomat.ts";
import {
  findClosingParenIndex,
  findNextBracketIndex
} from "@/utils/string-search.ts";

const pieceMoveRegex = /(?<pi>[NBRQK])(?<sf>[a-h])?(?<sr>[1-8])?x?(?<dc>[a-h][1-8])/;
const pawnMoveRegex = /((?<sf>[a-h])x)?(?<dc>[a-h][1-8])(=?(?<pr>[QRBN]))?/;
const castlingRegex = /(?<o>0|O)-\k<o>(?<o2>-\k<o>)?/;
const glyphRegex = /\$\d+/;

function findNonCastlingMove(position: ChacoMat.Position, { pi, sf, sr, dc, pr }: HalfMoveGroups) {
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

function findCastlingMove(position: ChacoMat.Position, isQueenSide: boolean) {
  for (const move of position.castlingMoves())
    if (move.isQueenSide() === isQueenSide)
      return move;

  return null;
}

export function playLine(line: string, game: ChacoMat.ChessGame) {
  let matchArr: RegExpMatchArray | null;

  for (const substring of line.split(/\s+/)) {
    if ((matchArr = substring.match(pieceMoveRegex)) || (matchArr = substring.match(pawnMoveRegex))) {
      const move = findNonCastlingMove(game.currentPosition, matchArr.groups as HalfMoveGroups);
      if (!move)
        throw new Error(`Illegal move "${substring}" in "${line}".`);
      game.playMove(move);
      continue;
    }

    if (matchArr = substring.match(castlingRegex)) {
      const move = findCastlingMove(game.currentPosition, matchArr.groups!.o2 !== void 0);
      if (!move)
        throw new Error(`Illegal move "${substring}" in "${line}".`);
      game.playMove(move);
      continue;
    }

    if (substring.endsWith("--")) {
      game.playNullMove();
      continue;
    }

    if (glyphRegex.test(substring) && game.currentPosition.srcMove) {
      game.currentPosition.srcMove.annotationGlyph = substring as ChacoMat.NumericAnnotationGlyph;
    }
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
    playLine(moveStr.slice(0, nextIndex).trim(), game);
    moveStr = moveStr.slice(nextIndex);
  }
}

type HalfMoveGroupKey = "pi" | "sf" | "sr" | "dc" | "pr" | "o" | "o2";
type HalfMoveGroups = { [K in HalfMoveGroupKey]?: string };