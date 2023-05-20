export const fenRegex = /^[1-8PNBRQKpnbrqk]{1,8}(\/[1-8PNBRQKpnbrqk]{1,8}){7} (w|b) (?!.*(.).*\1)([KQkq]{1,4}|[a-hA-H]{1,4}|-) ([a-h][1-8]|-) \d+ \d+$/;
export const pawnMoveRegex = /^(?<sf>[a-h])(x(?<df>[a-h]))?(?<dr>[1-8])(=?(?<pt>[QRBN]))?$/;
export const pieceMoveRegex = /^(?<pt>[KQRBN])(?<sf>[a-h])?(?<sr>[1-8])?x?(?<dc>[a-h][1-8])$/;
export const castlingRegex = /^(?<o>O|0)-\k<o>(?<o2>-\k<o>)?$/;
export const infoRegex = /^\[(?<k>\w+)\s+"(?<v>[^"]*)"\]/;
export const halfMoveRegex = /([a-h](x[a-h])?[1-8](=?[QRBN])?|[KQRBN][a-h]?[1-8]?x?[a-h][1-8]|(0|O)(-(0|O)){1,2})/g;

export function findClosingParenIndex(str: string, firstParenIndex: number): number {
  for (let i = firstParenIndex + 1, count = 1; i < str.length; i++) {
    if (str[i] === "(") {
      count++;
      continue;
    }

    if (str[i] === ")") {
      count--;
      if (count === 0)
        return i;
    }
  }

  throw new Error(`Unclosed parenthesis in string: "${str}"`);
}