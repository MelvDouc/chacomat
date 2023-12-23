export { default as Colors } from "$src/constants/Colors.ts";
export { default as SquareIndex, indexTable, pointTable } from "$src/constants/SquareIndex.ts";
export { default as Board } from "$src/game/Board.ts";
export { default as CastlingRights } from "$src/game/CastlingRights.ts";
export { default as ChessGame } from "$src/game/ChessGame.ts";
export { default as Position } from "src/game/Position.ts";
export { default as globalConfig } from "$src/global-config.ts";
export { default as Move } from "$src/moves/AbstractMove.ts";
export { default as NullMove } from "src/moves/NullMove.ts";
export { default as RealMove } from "src/moves/RealMove.ts";
export { default as Piece } from "src/pieces/Piece.ts";
export { default as Pieces } from "$src/pieces/Pieces.ts";
export { GameResults } from "pgnify";

export type * as ChacoMat from "$src/typings/types.ts";