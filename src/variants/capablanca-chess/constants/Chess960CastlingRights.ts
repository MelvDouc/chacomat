import Color from "@/constants/Color.ts";
import CastlingRights from "@/game/CastlingRights.ts";

export default class Chess960CastlingRights extends CastlingRights {
  protected static override readonly initials: Readonly<Record<string, [Color, number]>> = {
    k: [Color.BLACK, 9],
    q: [Color.BLACK, 0],
    K: [Color.WHITE, 9],
    Q: [Color.WHITE, 0]
  };
}