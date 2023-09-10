import { fileNameToY, rankNameToX } from "@/base/CoordsUtils.ts";
import { PgnVariations, parseVariations } from "@/pgn/utils.ts";
import CastlingMove from "@/standard/moves/CastlingMove.ts";
import type ShatranjGame from "@/variants/shatranj/ShatranjGame.ts";
import type ShatranjPosition from "@/variants/shatranj/ShatranjPosition.ts";

const halfMoveRegex = /([A-Za-i\d]{0,5}x?[a-i]\d+|(O|0)(-(O|0)){1,2})/g;
const ambiguousPieceMoveRegex = /^[A-Z](?<sy>[a-i])?(?<sx>\d+)?x?[a-i]\d+/;

const MOVE_FINDERS = {
  PAWN_MOVE: (input: string, { legalMoves, board }: ShatranjPosition) => {
    if (!input.includes("x")) {
      const destIndex = board.notationToIndex(input);
      return legalMoves.find((move) => {
        return board.get(move.srcIndex)?.isPawn() && move.destIndex === destIndex;
      });
    }

    const srcY = fileNameToY(input[0]);
    const destIndex = board.notationToIndex(input.slice(2));
    return legalMoves.find((move) => {
      return move.getSrcCoords(board).y === srcY && move.destIndex === destIndex;
    });
  },
  PIECE_MOVE: (input: string, { legalMoves, board }: ShatranjPosition) => {
    const destIndex = board.notationToIndex(input.slice(-2));
    const groups = input.match(ambiguousPieceMoveRegex)?.groups ?? {};
    const srcX = groups.sx ? rankNameToX(groups.sx, board.height) : null;
    const srcY = groups.sy ? fileNameToY(groups.sy) : null;

    return legalMoves.find((move) => {
      return move.destIndex === destIndex
        && board.get(move.srcIndex)?.initial.toUpperCase() === input[0]
        && (srcX === null || move.getSrcCoords(board).x === srcX)
        && (srcY === null || move.getSrcCoords(board).y === srcY);
    });
  },
  CASTLING: (input: string, { legalMoves }: ShatranjPosition) => {
    return legalMoves.find((move) => {
      return move instanceof CastlingMove && move.isQueenSide() === (input.length === 5);
    });
  }
} as const;

function findHalfMove(input: string, position: ShatranjPosition) {
  if (input.includes("-"))
    return MOVE_FINDERS.CASTLING(input, position);
  if (/^[A-Z]/.test(input))
    return MOVE_FINDERS.PIECE_MOVE(input, position);
  return MOVE_FINDERS.PAWN_MOVE(input, position);
  // return position.legalMoves.find((move) => {
  //   return move.getAlgebraicNotation(position.board, position.legalMoves) === input;
  // });
}

function playLine(line: string, game: ShatranjGame) {
  for (const { 0: substring, index } of line.matchAll(halfMoveRegex)) {
    const halfMove = findHalfMove(substring, game.currentPosition);

    if (!halfMove) {
      const errMessage = `Illegal move "${substring}" near "${line.slice(index)}" in "${line}".`;
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