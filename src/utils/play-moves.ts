import Colors from "$src/constants/Colors";
import IllegalMoveError from "$src/errors/IllegalMoveError";
import NullMove from "$src/moves/NullMove";
import PawnMove from "$src/moves/PawnMove";
import Pieces from "$src/pieces/Pieces";
import { ChessGame, NAG as NumericAnnotationGlyph, Piece, Position } from "$src/typings/types";
import type { PGNify } from "pgnify";

const moveRegex = /^(?<pi>[BKNQR])?(?<sf>[a-h])?(?<sr>[1-8])?x?(?<dc>[a-h][1-8])(=?(?<pr>[QRBN]))?/;

export default function playMoves(game: ChessGame, { comment, nodes }: PGNify.Variation) {
  if (comment)
    game.currentPosition.comment = comment;

  for (const { notation, NAG, comment, variations } of nodes) {
    const posBeforeMove = game.currentPosition;
    const move = findMove(posBeforeMove, notation);

    if (!move) {
      const error = new IllegalMoveError(`Illegal move: "${notation}".`);
      error.position = posBeforeMove;
      error.notation = notation;
      throw error;
    }

    if (move === NullMove)
      game.playNullMove();
    else
      game.playMove(move);

    const posAfterMove = game.currentPosition;
    (NAG && move !== NullMove) && (move.NAG = NAG as NumericAnnotationGlyph);
    comment && (posAfterMove.comment = comment);

    if (variations) {
      variations.forEach((variation) => {
        game.currentPosition = posBeforeMove;
        playMoves(game, variation);
      });
      game.currentPosition = posAfterMove;
    }
  }
}

function findMove(position: Position, notation: string) {
  if (notation === NullMove)
    return NullMove;

  if (notation.includes("-"))
    return findCastlingMove(position, notation.length === 5);

  const matchArr = notation.match(moveRegex);

  if (!matchArr)
    return null;

  const { pi, sf, sr, dc, pr } = matchArr.groups as HalfMoveGroups;
  let piece = Pieces.fromInitial(pi ?? "P") as Piece;
  if (position.activeColor === Colors.BLACK) piece = piece.opposite;

  for (const move of position.generateLegalMoves()) {
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

function findCastlingMove(position: Position, isQueenSide: boolean) {
  for (const move of position.castlingMoves())
    if (move.isQueenSide() === isQueenSide)
      return move;

  return null;
}

type HalfMoveGroupKey = "pi" | "sf" | "sr" | "dc" | "pr" | "o" | "o2";
type HalfMoveGroups = { [K in HalfMoveGroupKey]?: string };