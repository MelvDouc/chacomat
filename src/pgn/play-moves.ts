import Color from "@constants/Color.js";
import Piece from "@constants/Piece.js";
import Wing from "@constants/Wing.js";
import type ChessGame from "@game/ChessGame.js";
import Coords from "@game/Coords.js";
import type Position from "@game/Position.js";
import CastlingMove from "@moves/CastlingMove.js";
import type Move from "@moves/Move.js";
import PawnMove from "@moves/PawnMove.js";

const pieceMoveR = /[NBRQK][a-h]?[1-8]?x?[a-h][1-8]/.source;
const pawnMoveR = /[a-h](x[a-h])?[1-8]/.source;
const castlingR = /(0|O)(-(0|O)){1,2}/.source;
const halfMoveR1 = RegExp(`(?<halfMove1>${pieceMoveR}|${pawnMoveR}|${castlingR})(\\+|#)?`).source;
const halfMoveR2 = RegExp(`(?<halfMove2>${pieceMoveR}|${pawnMoveR}|${castlingR})(\\+|#)?`).source;
const moveRegex = RegExp(`(?<moveNo>\\d+)\\.{1,3}\\s*${halfMoveR1}(\\s+${halfMoveR2})?`, "gm");

const moveFinders: Readonly<MoveFinder[]> = [
  {
    regex: /^(?<file>[a-h])(?<rank>[1-8])/,
    findMove: ({ file, rank }, { legalMoves }) => {
      const destCoords = Coords.fromNotation(file + rank);
      return legalMoves.find((move) => {
        return move instanceof PawnMove && move.destCoords === destCoords;
      });
    }
  },
  {
    regex: /^(?<srcFile>[a-h])x(?<destFile>[a-h])(?<destRank>[1-8])/,
    findMove: ({ srcFile, destFile, destRank }, { legalMoves }) => {
      const srcY = Coords.fileNameToY(srcFile);
      const destCoords = Coords.fromNotation(destFile + destRank);
      return legalMoves.find((move) => {
        return move instanceof PawnMove
          && move.srcCoords.y === srcY
          && move.destCoords === destCoords;
      });
    }
  },
  {
    regex: /^(?<initial>[NBRQK])(?<srcFile>[a-h])?(?<srcRank>[1-8])?x?(?<destFile>[a-h])(?<destRank>[1-8])/,
    findMove: ({ initial, srcFile, srcRank, destFile, destRank }, { legalMoves, board, activeColor }) => {
      const srcX = srcRank ? Coords.rankNameToX(srcRank) : null;
      const srcY = srcFile ? Coords.fileNameToY(srcFile) : null;
      const destCoords = Coords.fromNotation(destFile + destRank);
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
    findMove: ({ o2 }, { legalMoves }) => {
      const wing = o2 ? Wing.QUEEN_SIDE : Wing.KING_SIDE;
      return legalMoves.find((move) => {
        return move instanceof CastlingMove && move.wing === wing;
      });
    }
  }
];

function parseMove(halfMoveStr: string, position: Position) {
  for (const { regex, findMove } of moveFinders) {
    const matches = halfMoveStr.match(regex);
    if (matches?.groups)
      return findMove(matches.groups, position);
  }

  return null;
}

function playMove(halfMoveStr: string, index: number, game: ChessGame): void {
  const halfMove = parseMove(halfMoveStr, game.currentPosition);
  if (!halfMove)
    throw new Error(`Invalid half-move ${halfMoveStr} at index ${index}.`);
  game.playMove(halfMove);
}

export default function playMoves(movesStr: string, game: ChessGame) {
  for (const { groups, index } of movesStr.matchAll(moveRegex)) {
    if (!groups) return;

    const moveNumber = parseInt(groups["moveNo"]);
    if (moveNumber !== game.currentPosition.fullMoveNumber)
      throw new Error(`Invalid move number ${moveNumber} at index ${index}.`);

    playMove(groups["halfMove1"], index as number, game);
    if (groups["halfMove2"])
      playMove(groups["halfMove2"], index as number, game);
  }
}

interface MoveFinder {
  regex: RegExp;
  findMove: (groups: Record<string, string>, position: Position) => Move | undefined;
};