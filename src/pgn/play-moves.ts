import Color from "@/constants/Color.ts";
import Coords from "@/constants/Coords.ts";
import { Piece } from "@/constants/Pieces.ts";
import type ChessGame from "@/game/ChessGame.ts";
import type Position from "@/game/Position.ts";
import CastlingMove from "@/game/moves/CastlingMove.ts";
import type Move from "@/game/moves/Move.ts";
import PawnMove from "@/game/moves/PawnMove.ts";
import { PgnVariations, parseVariations } from "@/pgn/utils.ts";

const pieceMoveR = /[NBRQK][a-h]?[1-8]?x?[a-h][1-8]/.source;
const pawnMoveR = /[a-h](x[a-h])?[1-8](=[QRBN])?/.source;
const castlingR = /(?<o>O|0)-\k<o>(-\k<o>)?/.source;
const halfMoveRegex = RegExp(`(?<halfMove>${pieceMoveR}|${pawnMoveR}|${castlingR})`, "g");

const MOVE_FINDERS: Readonly<MoveFinder[]> = [
  {
    regex: /^(?<file>[a-h])(?<rank>[1-8])/,
    find: ({ file, rank }, { legalMoves }) => {
      const destCoords = Coords.fromNotation(file + rank)!;
      return legalMoves.find((move) => {
        return move instanceof PawnMove && destCoords === move.destCoords;
      });
    }
  },
  {
    regex: /^(?<srcFile>[a-h])x(?<destFile>[a-h])(?<destRank>[1-8])/,
    find: ({ srcFile, destFile, destRank }, { legalMoves }) => {
      const srcY = Coords.fileNameToY(srcFile);
      const destCoords = Coords.fromNotation(destFile + destRank)!;
      return legalMoves.find((move) => {
        return move instanceof PawnMove
          && move.srcCoords.y === srcY
          && move.destCoords === destCoords;
      });
    }
  },
  {
    regex: /^(?<initial>[NBRQK])(?<srcFile>[a-h])?(?<srcRank>[1-8])?x?(?<destFile>[a-h])(?<destRank>[1-8])/,
    find: ({ initial, srcFile, srcRank, destFile, destRank }, { legalMoves, board, activeColor }) => {
      const srcX = srcRank ? Coords.rankNameToX(srcRank) : null;
      const srcY = srcFile ? Coords.fileNameToY(srcFile) : null;
      const destCoords = Coords.fromNotation(destFile + destRank)!;
      const piece = Piece.fromInitial(activeColor === Color.WHITE ? initial : initial.toLowerCase());
      return legalMoves.find((move) => {
        return move.destCoords === destCoords
          && board.get(move.srcCoords) === piece
          && (srcX === null || move.srcCoords.x === srcX)
          && (srcY === null || move.srcCoords.y === srcY);
      });
    }
  },
  {
    regex: /^(?<o>O|0)-\k<o>(?<o2>-\k<o>)?/,
    find: ({ o2 }, { legalMoves }) => {
      return legalMoves.find((move) => {
        return move instanceof CastlingMove && move.isQueenSide() === !!o2;
      });
    }
  }
];

function findHalfMove(halfMoveStr: string, position: Position) {
  for (const { regex, find } of MOVE_FINDERS) {
    const matches = halfMoveStr.match(regex);
    if (matches?.groups)
      return find(matches.groups, position);
  }

  return null;
}

function playLine(line: string, game: ChessGame) {
  for (const { groups } of line.matchAll(halfMoveRegex)) {
    if (!groups) break;

    const halfMove = findHalfMove(groups["halfMove"], game.currentPosition);

    if (!halfMove)
      throw new Error(`Illegal move "${groups["halfMove"]}" in "${line}".`);

    game.playMove(halfMove);
  }
}

export default function playMoves(movesStr: string, game: ChessGame) {
  parseVariations(movesStr).forEach(function recurse({ line, variations }: PgnVariations) {
    playLine(line, game);
    const current = game.currentPosition;
    const { prev } = current;
    variations.forEach((element) => {
      game.currentPosition = prev!;
      recurse(element);
    });
    game.currentPosition = current;
  });
}

interface MoveFinder {
  regex: RegExp;
  find: (groups: Record<string, string>, position: Position) => Move | undefined;
};