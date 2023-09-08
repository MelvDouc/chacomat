import CastlingRights from "@/game/CastlingRights.ts";
import Color from "@/game/Color.ts";

export default class CapablancaCastlingRights extends CastlingRights {
  public static override readonly initials: Readonly<Record<string, [Color, number]>> = {
    k: [Color.BLACK, 10 - 1],
    q: [Color.BLACK, 0],
    K: [Color.WHITE, 10 - 1],
    Q: [Color.WHITE, 0]
  };
}