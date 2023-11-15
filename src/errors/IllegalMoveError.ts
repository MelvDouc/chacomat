import { Point, Position } from "$src/typings/types.ts";

export default class IllegalMoveError extends Error {
  position?: Position;
  notation?: string;
  srcPoint?: Point;
  destPoint?: Point;
}