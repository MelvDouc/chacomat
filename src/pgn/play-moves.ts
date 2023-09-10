import CastlingMove from "@/international/moves/CastlingMove.ts";
import { PgnVariations, parseVariations } from "@/pgn/utils.ts";
import type ShatranjGame from "@/variants/shatranj/ShatranjGame.ts";
import type ShatranjPosition from "@/variants/shatranj/ShatranjPosition.ts";

const halfMoveRegex = /([NBRQKa-h1-8]{0,4}x?[a-h][1-8]|(O|0)(-(O|0)){1,2})/g;

const MOVE_FINDERS = {
  PAWN_MOVE: (str: string, { legalMoves, board }: ShatranjPosition) => {
    const destCoords = board.Coords.fromNotation(str.slice(-2));

    if (!str.includes("x"))
      return legalMoves.find((move) => {
        return board.getByCoords(move.srcCoords)!.isPawn() && destCoords === move.destCoords;
      });

    const srcY = board.Coords.fileNameToY(str[0]);
    return legalMoves.find((move) => {
      return move.srcCoords.y === srcY && move.destCoords === destCoords;
    });
  },
  PIECE_MOVE: (str: string, { legalMoves, board }: ShatranjPosition) => {
    const destCoords = board.Coords.fromNotation(str.slice(-2));
    const groups = str.match(/^[NBRQK](?<sy>[a-h])?(?<sx>[1-8])?x?[a-h][1-8]/)?.groups ?? {};
    const srcX = groups.sx ? board.Coords.rankNameToX(groups.sx) : null;
    const srcY = groups.sy ? board.Coords.fileNameToY(groups.sy) : null;

    return legalMoves.find((move) => {
      return move.destCoords === destCoords
        && board.getByCoords(move.srcCoords)?.initial.toUpperCase() === str[0]
        && (srcX === null || move.srcCoords.x === srcX)
        && (srcY === null || move.srcCoords.y === srcY);
    });
  },
  CASTLING: (str: string, { legalMoves }: ShatranjPosition) => {
    return legalMoves.find((move) => {
      return move instanceof CastlingMove && move.isQueenSide() === (str.length === 5);
    });
  }
} as const;

function findHalfMove(input: string, position: ShatranjPosition) {
  if (input.includes("-"))
    return MOVE_FINDERS.CASTLING(input, position);
  if (/^[NBRQK]/.test(input))
    return MOVE_FINDERS.PIECE_MOVE(input, position);
  return MOVE_FINDERS.PAWN_MOVE(input, position);
}

function playLine(line: string, game: ShatranjGame) {
  const matches = line.match(halfMoveRegex);
  if (!matches) return;

  for (const input of matches) {
    const halfMove = findHalfMove(input, game.currentPosition);

    if (!halfMove) {
      const errMessage = `Illegal move "${input}" in "${line}".`;
      throw new Error(errMessage);
    }

    game.playMove(halfMove);
  }
}

function playLineAndVars(game: ShatranjGame, { line, variations, comment }: PgnVariations) {
  playLine(line, game);
  if (comment !== undefined) game.currentPosition.comment = comment;

  const current = game.currentPosition;
  variations.forEach((variation) => {
    game.currentPosition = current.prev!;
    playMoves(variation, game);
  });
  game.currentPosition = current;
}

export default function playMoves(movesStr: string, game: ShatranjGame) {
  parseVariations(movesStr).forEach((element) => playLineAndVars(game, element));
}