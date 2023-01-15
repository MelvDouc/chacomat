import { ChessGame } from "@chacomat/types.js";

const halfMoveRegexes = {
  PAWN_MOVE: /^P?[a-h][1-8](=?[NBRQ])?(\+{1,2}|#)?$/,
  PLAIN_PIECE_MOVE: /[NBRQK]x?[a-h][1-8](\+{1,2}|#)?$/,
  AMBIGUOUS_PIECE_MOVE: /[NBRQK][a-h]?[1-8]?x?[a-h][1-8](\+{1,2}|#)?$/
} as const;

const pawnMoveRegex = /[a-h](x[a-h])?[1-8](=?[NBRQ])?/,
  pieceMoveRegex = /[PNBRQK][a-h]?[1-8]?x?[a-h][1-8]/,
  castlingRegex = /(0-0(-0)?|O-O(-O)?)/,
  checkRegex = /(\+{1,2}|#)?/,
  halfMove = `(${pawnMoveRegex.source}|${pieceMoveRegex.source}|${castlingRegex.source})`,
  halfMoveAndCheckRegex = halfMove + checkRegex.source;
const moveRegex = new RegExp(`(?<=\\d+\\.\\s*)${halfMoveAndCheckRegex}(\\s+${halfMoveAndCheckRegex})?`, "g");

function playMovesFromPgn(pgnStr: string, game: ChessGame) {
  const movePairs = pgnStr.match(moveRegex) as string[];

  movePairs.forEach((pair) => {
    const [whiteMove, blackMove] = pair.slice(pair.indexOf(".") + 1).trim().split(/\s+/);
    const { legalMoves } = game.currentPosition;

    if (halfMoveRegexes.PAWN_MOVE.test(whiteMove)) {
      // const move = legalMoves.find(([src, dest]) => {

      // });
    }

    // let key: keyof typeof halfMoveRegexes;
    // for( key in halfMoveRegexes) {
    //   if (halfMoveRegexes[key].test(whiteMove)) {

    //   }
    // }
  });
}