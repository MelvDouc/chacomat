import { BlackAndWhite, Color } from "../types.local.js";

export const colors = ["WHITE", "BLACK"] as const;

export const ReversedColor = {
  WHITE: "BLACK",
  BLACK: "WHITE"
} as BlackAndWhite<Color>;

export const ConsoleColors = {
  Reset: "\x1b[0m",
  FgBlack: "\x1b[30m",
  BgWhite: "\x1b[47m",
  BgGreen: "\x1b[42m"
} as const;