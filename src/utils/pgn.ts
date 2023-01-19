import Coords from "@chacomat/game/Coords.js";
import { Board, ChessFileName, ChessGame, Move } from "@chacomat/types.js";

const HALF_MOVE_REGEXES = {
  STRAIGHT_PAWN_MOVE: /^[a-h][1-8](\+{1,2}|#)?$/,
  PAWN_CAPTURE: /^[a-h]x[a-h][1-8](\+{1,2}|#)?$/,
  CLEAR_PIECE_MOVE: /[NBRQK]x?[a-h][1-8](\+{1,2}|#)?$/,
  AMBIGUOUS_PIECE_MOVE: /[NBRQK][a-h]?[1-8]?x?[a-h][1-8](\+{1,2}|#)?$/
} as const;

const pawnMoveRegex = /[a-h](x[a-h])?[1-8](=?[NBRQ])?/,
  pieceMoveRegex = /[NBRQK][a-h]?[1-8]?x?[a-h][1-8]/,
  castlingRegex = /(0-0(-0)?|O-O(-O)?)/,
  checkRegex = /(\+{1,2}|#)?/,
  halfMove = `(${pawnMoveRegex.source}|${pieceMoveRegex.source}|${castlingRegex.source})`,
  halfMoveAndCheckRegex = halfMove + checkRegex.source;
const moveRegex = new RegExp(`(?<=\\d+\\.\\s*)${halfMoveAndCheckRegex}(\\s+${halfMoveAndCheckRegex})?`, "g");

function playMovesFromPgn(pgnStr: string, game: ChessGame) {
  const movePairs = pgnStr.match(moveRegex) as string[];

  movePairs.forEach((pair) => {
    const [whiteMove, blackMove] = pair.slice(pair.indexOf(".") + 1).trim().split(/\s+/);
    const { board, legalMoves } = game.currentPosition;

    if (HALF_MOVE_REGEXES.STRAIGHT_PAWN_MOVE.test(whiteMove)) {
      const move = getPlainPawnMove(whiteMove, board, legalMoves);
      game.move(move[0], move[1]);
    } else if (HALF_MOVE_REGEXES.PAWN_CAPTURE.test(whiteMove)) {
      const move = getPawnCapture(whiteMove, board, legalMoves);
      game.move(move[0], move[1]);
    }

    // let key: keyof typeof halfMoveRegexes;
    // for( key in halfMoveRegexes) {
    //   if (halfMoveRegexes[key].test(whiteMove)) {

    //   }
    // }
  });
}

function getPlainPawnMove(moveText: string, board: Board, legalMoves: Move[]) {
  const file = Coords.getFileNameIndex(moveText[0] as ChessFileName),
    rank = 8 - Number(moveText[1]);
  const move = legalMoves.find(([src, dest]) => {
    return dest.x === rank
      && dest.y === file
      && board.get(src)?.isPawn();
  })!;
  return move;
}

function getPawnCapture(moveText: string, board: Board, legalMoves: Move[]) {
  const srcY = Coords.getFileNameIndex(moveText[0] as ChessFileName),
    destY = Coords.getFileNameIndex(moveText[2] as ChessFileName),
    destX = 8 - Number(moveText[3]);
  const move = legalMoves.find(([src, dest]) => {
    return dest.x === destX
      && src.y === srcY
      && dest.y === destY
      && board.get(src)?.isPawn();
  })!;
  return move;
}