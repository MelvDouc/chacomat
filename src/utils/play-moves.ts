import Coords from "@/coordinates/Coords.ts";
import PawnMove from "@/moves/PawnMove.ts";
import Piece from "@/pieces/Piece.ts";
import { ChacoMat } from "@/typings/chacomat.ts";
import { type PGNParserTypes } from "@deps";

const moveRegex = /^(?<pi>[BKNQR])?(?<sf>[a-h])?(?<sr>[1-8])?x?(?<dc>[a-h][1-8])(=?(?<pr>[QRBN]))?/;

export default function playMoves(game: ChacoMat.ChessGame, mainLine: PGNParserTypes.Line) {
  if (mainLine.comment)
    game.currentPosition.comment = mainLine.comment;

  mainLine.moveNodes.forEach(({ notation, NAG, comment, variations }) => {
    const { currentPosition } = game;
    let next: ChacoMat.Position;

    if (notation === "--") {
      game.playNullMove();
      next = game.currentPosition;
    } else {
      const move = findMove(currentPosition, notation);

      if (!move)
        throw new Error(`Illegal move: "${notation}".`);

      if (NAG)
        move.annotationGlyph = NAG;

      game.playMove(move);
      next = game.currentPosition;
    }

    if (comment)
      next.comment = comment;

    if (variations) {
      variations.forEach((variation) => {
        game.currentPosition = currentPosition;
        playMoves(game, variation);
      });
      game.currentPosition = next;
    }
  });
}

function findMove(position: ChacoMat.Position, notation: string) {
  if (notation.includes("-"))
    return findCastlingMove(position, notation.length === 5);

  const matchArr = notation.match(moveRegex);

  if (!matchArr || !matchArr.groups)
    return null;

  return findNonCastlingMove(position, matchArr.groups as HalfMoveGroups);
}

function findNonCastlingMove(position: ChacoMat.Position, { pi, sf, sr, dc, pr }: HalfMoveGroups) {
  const destCoords = Coords.fromNotation(dc as string);
  const piece = Piece.fromWhiteInitialAndColor(pi ?? "P", position.activeColor)!;

  for (const move of position.generateLegalMoves()) {
    if (
      move.srcPiece === piece
      && move.destCoords === destCoords
      && (!sf || move.srcCoords.fileName === sf)
      && (!sr || move.srcCoords.rankName === sr)
      && (!(move instanceof PawnMove) || !move.isPromotion() || move.promotedPiece?.whiteInitial === pr)
    ) {
      return move;
    }
  }

  return null;
}

function findCastlingMove(position: ChacoMat.Position, isQueenSide: boolean) {
  for (const move of position.castlingMoves())
    if (move.isQueenSide() === isQueenSide)
      return move;

  return null;
}

type HalfMoveGroupKey = "pi" | "sf" | "sr" | "dc" | "pr" | "o" | "o2";
type HalfMoveGroups = { [K in HalfMoveGroupKey]?: string };