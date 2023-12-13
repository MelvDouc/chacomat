import Colors from "$src/constants/Colors.ts";
import NullMove from "$src/moves/NullMove.ts";
import PawnMove from "$src/moves/PawnMove.ts";
import Pieces from "$src/pieces/Pieces.ts";
import { ChessGame, Piece, Position } from "$src/typings/types.ts";
import { type IVariation } from "pgnify";

const moveRegex = /^(?<pi>[BKNQR])?(?<sf>[a-h])?(?<sr>[1-8])?x?(?<dc>[a-h][1-8])(=?(?<pr>[QRBN]))?/;
const castlingRegex = /^(?<o>[0O])(-\k<o>){1,2}/;

export default function playMoves(game: ChessGame, { comment, nodes }: IVariation) {
  if (comment)
    game.currentPosition.comment = comment;

  for (const { notation, NAG, comment, variations } of nodes) {
    const posBeforeMove = game.currentPosition;
    const move = findMove(posBeforeMove, notation);

    if (!move)
      throw new Error("Illegal move.", {
        cause: {
          notation,
          position: posBeforeMove
        }
      });

    if (NAG) move.NAG = NAG;
    if (comment) move.comment = comment;
    game.playMove(move);
    const posAfterMove = game.currentPosition;

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
  if (notation === NullMove.algebraicNotation)
    return NullMove.instance;

  if (castlingRegex.test(notation))
    return findCastlingMove(position, notation[3] === "-");

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

type HalfMoveGroupKey = "pi" | "sf" | "sr" | "dc" | "pr";
type HalfMoveGroups = { [K in HalfMoveGroupKey]?: string };