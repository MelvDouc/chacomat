const fenRegex = /^[1-8PNBRQKpnbrqk]{1,8}(\/[1-8PNBRQKpnbrqk]{1,8}){7} (w|b) (?!.*(.).*\1)([KQkq]{1,4}|[a-hA-H]{1,4}|-) ([a-h][1-8]|-) \d+ \d+$/;

export function isValidFen(fen: string): boolean {
  return fenRegex.test(fen);
}