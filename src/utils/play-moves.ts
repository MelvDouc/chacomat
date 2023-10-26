import Coords from "@/board/Coords.ts";
import CastlingMove from "@/moves/CastlingMove.ts";
import EnPassantPawnMove from "@/moves/EnPassantPawnMove.ts";
import PawnMove from "@/moves/PawnMove.ts";
import PieceMove from "@/moves/PieceMove.ts";
import Piece from "@/pieces/Piece.ts";
import { ChacoMat } from "@/typings/chacomat.ts";
import {
  findClosingParenIndex,
  findNextBracketIndex
} from "@/utils/string-search.ts";

type HalfMoveGroupKey = "pi" | "sf" | "sr" | "dc" | "pr" | "o" | "o2";
type HalfMoveGroups = { [K in HalfMoveGroupKey]?: string };

const nonCastlingRegex = /(?<pi>[NBRQK])?(?<sf>[a-h])?(?<sr>[1-8])?x?(?<dc>[a-h][1-8])(?<pr>=?[QRBN])?/;
const castlingRegex = /(?<o>0|O)-\k<o>(?<o2>-\k<o>)?/;
const halfMoveRegex = RegExp(`(${nonCastlingRegex.source}|${castlingRegex.source})`, "g");

function findCastlingMove(legalMoves: ChacoMat.Position["legalMoves"], isQueenSide: boolean) {
  for (let i = 1; i <= 2; i++) {
    const move = legalMoves[legalMoves.length - i];
    if (move instanceof CastlingMove && move.isQueenSide() === isQueenSide)
      return move;
  }

  return null;
}

function findMove(position: ChacoMat.Position, { pi, sf, sr, dc, pr, o, o2 }: HalfMoveGroups) {
  if (o)
    return findCastlingMove(position.legalMoves, o2 !== void 0);

  const { activeColor, board } = position;
  const destCoords = Coords.fromNotation(dc as string)!;
  const piece = Piece.fromWhiteInitialAndColor(pi ?? "P", activeColor)!;

  for (const srcCoords of piece.reverseSearch(position, destCoords)) {
    if (sf && srcCoords.fileName !== sf || sr && srcCoords.rankName !== sr)
      continue;

    if (!piece.isPawn())
      return new PieceMove(srcCoords, destCoords, piece, board.get(srcCoords));

    if (destCoords === position.enPassantCoords)
      return new EnPassantPawnMove(srcCoords, destCoords, piece);

    if (destCoords.y === activeColor.opposite.pieceRank)
      return new PawnMove(
        srcCoords,
        destCoords,
        piece,
        board.get(srcCoords),
        Piece.fromWhiteInitialAndColor(pr ?? "Q", activeColor)
      );

    return new PawnMove(srcCoords, destCoords, piece, board.get(srcCoords));
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