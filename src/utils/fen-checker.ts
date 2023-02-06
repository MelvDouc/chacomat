import { FenString } from "@chacomat/types.local.js";

const boardRegex = /[1-8PNBRQKpnbrqk]{1,8}(\/[1-8PNBRQKpnbrqk]{1,8}){7}/;
const castlingRegex = /(([KQkq]|[A-Ha-h]){1,4}|-)/;
const enPassantRegex = /([a-h][1-8]|-)/;
const moveNumberRegex = /\d+/;
const fenRegex = new RegExp("^" + [
  boardRegex,
  /(w|b)/,
  castlingRegex,
  enPassantRegex,
  moveNumberRegex,
  moveNumberRegex
].map((regex) => regex.source).join(" ") + "$");

export default {
  nullCharacter: "-",
  rowSeparator: "/",
  isValidFenString: (fenString: FenString): boolean => fenRegex.test(fenString)
} as const;