import Color from "@/constants/Color.ts";
import CastlingRights from "@/international/CastlingRights.ts";

export default class CapablancaCastlingRights extends CastlingRights {
  public static override readonly initials: Readonly<Record<string, [Color, number]>> = {
    k: [Color.BLACK, 10 - 1],
    q: [Color.BLACK, 0],
    K: [Color.WHITE, 10 - 1],
    Q: [Color.WHITE, 0]
  };
}