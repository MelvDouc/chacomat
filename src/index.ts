export { default as Color } from "$src/constants/Color.js";
export { default as SquareIndex, indexTable, pointTable } from "$src/constants/SquareIndex.js";
export { default as Board } from "$src/game/Board.js";
export { default as CastlingRights } from "$src/game/CastlingRights.js";
export { default as ChessGame } from "$src/game/ChessGame.js";
export { default as Position } from "$src/game/Position.js";
export { default as globalConfig } from "$src/global-config.js";
export { default as Move } from "$src/moves/AbstractMove.js";
export { default as NullMove } from "$src/moves/NullMove.js";
export { default as RealMove } from "$src/moves/RealMove.js";
export { default as Piece } from "$src/pieces/Piece.js";
export { default as Pieces } from "$src/pieces/Pieces.js";
export { GameResults } from "pgnify";

export type * as ChacoMat from "$src/typings/types.js";