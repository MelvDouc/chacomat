import { Point, Position } from "$src/typings/types";

export default class IllegalMoveError extends Error {
  position?: Position;
  notation?: string;
  srcPoint?: Point;
  destPoint?: Point;
}