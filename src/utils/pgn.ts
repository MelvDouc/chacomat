import Coords from "@chacomat/game/Coords.js";
import { Board, ChessFileName, ChessGame, Move } from "@chacomat/types.js";

const pawnMoveRegex = /[a-h](x[a-h])?[1-8](=?[NBRQ])?/,
  pieceMoveRegex = /[NBRQK][a-h]?[1-8]?x?[a-h][1-8]/,
  castlingRegex = /(0-0(-0)?|O-O(-O)?)/,
  checkRegex = /(\+{1,2}|#)?/,
  halfMove = `(${pawnMoveRegex.source}|${pieceMoveRegex.source}|${castlingRegex.source})`,
  halfMoveAndCheckRegex = halfMove + checkRegex.source;
const moveRegex = new RegExp(`(?<=\\d+\\.\\s*)${halfMoveAndCheckRegex}(\\s+${halfMoveAndCheckRegex})?`, "g");

const HALF_MOVE_REGEXES = {
  STRAIGHT_PAWN_MOVE: /^[a-h][1-8](\+{1,2}|#)?$/,
  PAWN_CAPTURE: /^[a-h]x[a-h][1-8](\+{1,2}|#)?$/,
  CLEAR_PIECE_MOVE: /^[NBRQK]x?[a-h][1-8](\+{1,2}|#)?$/,
  AMBIGUOUS_PIECE_MOVE: /^[NBRQK][a-h]?[1-8]?x?[a-h][1-8](\+{1,2}|#)?$/,
  CASTLING: new RegExp(`^${castlingRegex.source}$`)
} as const;

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
    } else if (HALF_MOVE_REGEXES.CLEAR_PIECE_MOVE.test(whiteMove)) {
      const move = getPieceMove(whiteMove, board, legalMoves);
      game.move(move[0], move[1]);
    } else if (HALF_MOVE_REGEXES.AMBIGUOUS_PIECE_MOVE.test(whiteMove)) {
      const move = getAmbiguousPieceMove(whiteMove, board, legalMoves);
      game.move(move[0], move[1]);
    }
  });
}

function getPlainPawnMove(moveText: string, board: Board, legalMoves: Move[]) {
  const y = Coords.File[moveText[0] as ChessFileName],
    destX = 8 - Number(moveText[1]);
  const move = legalMoves.find(([src, dest]) => {
    return dest.x === destX
      && dest.y === y
      && board.get(src)?.isPawn();
  })!;
  return move;
}

function getPawnCapture(moveText: string, board: Board, legalMoves: Move[]) {
  const srcY = Coords.File[moveText[0] as ChessFileName],
    destY = Coords.File[moveText[2] as ChessFileName],
    destX = 8 - Number(moveText[3]);
  const move = legalMoves.find(([src, dest]) => {
    return dest.x === destX
      && src.y === srcY
      && dest.y === destY
      && board.get(src)?.isPawn();
  })!;
  return move;
}

function getPieceMove(moveText: string, board: Board, legalMoves: Move[]) {
  moveText = moveText.replace("x", "");
  const destY = Coords.File[moveText[1] as ChessFileName],
    destX = 8 - Number(moveText[2]);
  const move = legalMoves.find(([src, dest]) => {
    return dest.x === destX
      && dest.y === destY
      && board.get(src)?.type === moveText[0];
  })!;
  return move;
}

function getAmbiguousPieceMove(moveText: string, board: Board, legalMoves: Move[]) {
  const chars = moveText.replace("x", "").replace(checkRegex, "").split("");
  let srcX: number, srcY: number;
  const destY = Coords.File[chars.at(-2) as ChessFileName],
    destX = 8 - Number(chars.at(-1));
  if (chars.length === 4) {
    if (!isNaN(Number(chars[1])))
      srcY = Coords.File[chars[1] as ChessFileName];
    else
      srcX = 8 - Number(chars[1]);
  } else {
    srcY = Coords.File[chars[1] as ChessFileName];
    srcX = 8 - Number(chars[2]);
  }
  const move = legalMoves.find(([src, dest]) => {
    if (srcX !== undefined && src.x !== srcX)
      return false;
    if (srcY !== undefined && src.y !== srcY)
      return false;
    return dest.x === destX
      && dest.y === destY
      && board.get(src)?.type === moveText[0];
  })!;
  return move;
}