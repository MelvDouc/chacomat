// Game
export { default as Color } from "$src/game/Color.js";
export { default as Board } from "$src/game/Board.js";
export { default as CastlingRights } from "$src/game/CastlingRights.js";
export { default as ChessGame } from "$src/game/ChessGame.js";
export { default as Point } from "$src/game/Point.js";
export { default as Position } from "$src/game/Position.js";
export type { default as PositionTree } from "$src/game/PositionTree.js";
export { SquareIndex, BOARD_LENGTH } from "$src/game/constants.js";

// Moves
export type { default as Move } from "$src/moves/Move.js";
export type { default as RegularMove } from "$src/moves/RegularMove.js";
export { default as CastlingMove } from "$src/moves/CastlingMove.js";
export { default as NullMove } from "$src/moves/NullMove.js";
export { default as PawnMove } from "$src/moves/PawnMove.js";
export { default as PieceMove } from "$src/moves/PieceMove.js";

// Pieces
export { default as Piece } from "$src/pieces/Piece.js";
export { default as Pieces } from "$src/pieces/Pieces.js";

// Other
export { IllegalMoveError, InvalidFENError } from "$src/utils/errors.js";
export { default as globalConfig } from "$src/global-config.js";
export { GameResults } from "pgnify";
export type * as ChacoMat from "$src/types.js";