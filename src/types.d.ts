import type Position from "@game/Position.js";
import type ChessGame from "@game/ChessGame.js";

export type Status = typeof Position["Status"][keyof typeof Position["Status"]];
export type Result = typeof ChessGame["Result"][keyof typeof ChessGame["Result"]];