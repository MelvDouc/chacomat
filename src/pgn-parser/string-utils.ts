import GameResults from "$src/constants/GameResults";
import { GameResult, NAG } from "$src/typings/types.ts";

const nagRegex = /^\$\d+$/;
const headerRegex = /^(?<key>\w+)\s+"(?<value>[^"]*)"/;

export const EOF = "\0";

export function isWhiteSpace(char: string) {
  return char === " "
    || char === "\n"
    || char === "\t"
    || char === "\r"
    || char === "\f"
    || char === "\v"
    || char === "\u00a0"
    || char === "\u1680"
    || char === "\u2000"
    || char === "\u200a"
    || char === "\u2028"
    || char === "\u2029"
    || char === "\u202f"
    || char === "\u205f"
    || char === "\u3000"
    || char === "\ufeff";
}

export function isBracket(char: string) {
  return char === "("
    || char === ")"
    || char === "["
    || char === "]"
    || char === "{"
    || char === "}";
}

export function isValuedTokenChar(char: string, substring: string) {
  if (substring.endsWith("."))
    return char === ".";
  return !isWhiteSpace(char) && !isBracket(char);
}

export function isGameResult(arg: string): arg is GameResult {
  return arg === GameResults.NONE
    || arg === GameResults.DRAW
    || arg === GameResults.WHITE_WIN
    || arg === GameResults.BLACK_WIN;
}

export function isNAG(arg: string): arg is NAG {
  return nagRegex.test(arg);
}

export function parseHeader(value: string) {
  const matchArr = value.match(headerRegex);

  if (!matchArr || !matchArr.groups)
    throw new Error(`Invalid header: <${value}>.`);

  return {
    key: matchArr.groups.key,
    value: matchArr.groups.value
  };
}