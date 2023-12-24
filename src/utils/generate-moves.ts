import Position from "$src/game/Position.js";
import CastlingMove from "$src/moves/CastlingMove.js";
import PawnMove from "$src/moves/PawnMove.js";
import PieceMove from "$src/moves/PieceMove.js";
import type { Wing } from "$src/typings/types.js";

export function* nonCastlingMoves(position: Position) {
  const { board, activeColor, enPassantIndex } = position;

  for (const [srcIndex, piece] of board.getEntries()) {
    if (piece.color !== activeColor)
      continue;

    for (const destIndex of piece.getPseudoLegalDestIndices({ board, srcIndex, enPassantIndex })) {
      const isEnPassant = destIndex === enPassantIndex;
      const move = piece.isPawn()
        ? new PawnMove({
          srcIndex,
          destIndex,
          srcPiece: piece,
          destPiece: isEnPassant ? piece.opposite : board.get(destIndex),
          isEnPassant
        })
        : new PieceMove({
          srcIndex,
          destIndex,
          srcPiece: piece,
          destPiece: board.get(destIndex)
        });
      move.play(board);
      const isLegal = !board.isKingEnPrise(activeColor);
      move.undo(board);

      if (isLegal) {
        if (move instanceof PawnMove && move.isPromotion())
          yield* move.promotions();
        else
          yield move;
      }
    }
  }
}

export function* castlingMoves({ activeColor, board, castlingRights }: Position) {
  const enemyAttacks = board.getColorAttacks(activeColor.opposite);

  if (enemyAttacks.has(board.getKingIndex(activeColor)))
    return;

  const rights = activeColor.isWhite()
    ? castlingRights.white
    : castlingRights.black;
  let wing: Wing;

  for (wing in rights) {
    if (!rights[wing]) continue;
    const move = new CastlingMove({ color: activeColor, wing });
    if (move.isLegal(board, enemyAttacks))
      yield move;
  }
}