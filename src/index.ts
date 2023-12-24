// Constants
export { default as Color } from "$src/constants/Color.js";
export { default as SquareIndex, indexTable, pointTable } from "$src/constants/SquareIndex.js";
export { BOARD_WIDTH, SQUARE_COUNT } from "$src/constants/dimensions.js";

// Errors
export { default as IllegalMoveError } from "$src/errors/IllegalMoveError.js";
export { default as InvalidFenError } from "$src/errors/InvalidFenError.js";

// Game
export { default as Board } from "$src/game/Board.js";
export { default as CastlingRights } from "$src/game/CastlingRights.js";
export { default as ChessGame } from "$src/game/ChessGame.js";
export { default as Position } from "$src/game/Position.js";
export { default as PositionTree } from "$src/game/PositionTree.js";

// Moves
export { default as Move } from "$src/moves/AbstractMove.js";
export { default as NullMove } from "$src/moves/NullMove.js";
export { default as RealMove } from "$src/moves/RealMove.js";

// Pieces
export { default as Piece } from "$src/pieces/Piece.js";
export { default as Pieces } from "$src/pieces/Pieces.js";

// Other
export { default as globalConfig } from "$src/global-config.js";
export { GameResults } from "pgnify";
export type * as ChacoMat from "$src/typings/types.js";