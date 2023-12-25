import type ChessGame from "$src/game/ChessGame.js";
import IllegalMoveError from "$src/errors/IllegalMoveError.js";
import type Position from "$src/game/Position.js";
import NullMove from "$src/moves/NullMove.js";
import PawnMove from "$src/moves/PawnMove.js";
import type Piece from "$src/pieces/Piece.js";
import Pieces from "$src/pieces/Pieces.js";
import { castlingMoves, nonCastlingMoves } from "$src/utils/generate-moves.js";
import { type Variation } from "pgnify";

const moveRegex = /^(?<pi>[BKNQR])?(?<sf>[a-h])?(?<sr>[1-8])?x?(?<dc>[a-h][1-8])(=?(?<pr>[QRBN]))?/;
const castlingRegex = /^(?<o>[0O])(-\k<o>){1,2}/;

/**
 * @throws {IllegalMoveError}
 */
export default function playMoves(game: ChessGame, { comment, nodes }: Variation) {
  if (comment)
    game.currentPosition.comment = comment;

  for (const { notation, NAG, comment, variations } of nodes) {
    const treeBefore = game.tree;
    const move = findMove(treeBefore.position, notation);

    if (!move)
      throw new IllegalMoveError({
        message: `Illegal move "${notation}".`,
        position: treeBefore.position,
        notation
      });

    if (NAG) move.NAG = NAG;
    if (comment) move.comment = comment;
    game.playMove(move);
    const treeAfter = game.tree;

    if (variations) {
      variations.forEach((variation) => {
        game.tree = treeBefore;
        playMoves(game, variation);
      });
      game.tree = treeAfter;
    }
  }
}

function findMove(position: Position, notation: string) {
  if (castlingRegex.test(notation)) {
    const isQueenSide = notation[3] === "-";
    return [...castlingMoves(position)].find((move) => {
      return move.isQueenSide() === isQueenSide;
    });
  }

  const matchArr = notation.match(moveRegex);

  if (!matchArr) {
    return (notation === NullMove.algebraicNotation)
      ? NullMove.instance
      : null;
  }

  const { pi, sf, sr, dc, pr } = matchArr.groups as HalfMoveGroups;
  let piece = Pieces.fromInitial(pi ?? "P") as Piece;
  if (!position.activeColor.isWhite()) piece = piece.opposite;

  for (const move of nonCastlingMoves(position)) {
    if (
      move.srcPiece === piece
      && move.destNotation === dc
      && (!sf || move.srcNotation[0] === sf)
      && (!sr || move.srcNotation[1] === sr)
      && (!(move instanceof PawnMove) || !move.isPromotion() || move.promotionInitial === pr)
    ) {
      return move;
    }
  }

  return null;
}

type HalfMoveGroupKey = "pi" | "sf" | "sr" | "dc" | "pr";
type HalfMoveGroups = { [K in HalfMoveGroupKey]?: string };