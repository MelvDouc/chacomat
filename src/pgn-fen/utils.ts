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