import IColor from "@/typings/IColor.ts";

export default interface ICastlingRights {
  get(color: IColor): Set<number>;
  clone(): this;
  toString(boardWidth: number): string;
}