const findClosingParenIndex = createClosingCharIndexSearchFn("(", ")");
const findClosingCurlyIndex = createClosingCharIndexSearchFn("{", "}");

function createClosingCharIndexSearchFn(openingChar: string, closingChar: string) {
  return (str: string, startIndex: number) => {
    for (let i = startIndex, count = 0; i < str.length; i++) {
      if (str[i] === openingChar) {
        count++;
        continue;
      }

      if (str[i] === closingChar) {
        count--;
        if (count === 0)
          return i;
      }
    }

    throw new Error(`Unclosed parenthesis in string: "${str}"`);
  };
}

export function parseVariations(movesStr: string): PgnVariations[] {
  const lines: PgnVariations[] = [];

  while (movesStr.length) {
    const openingParenIndex = movesStr.indexOf("(");

    if (openingParenIndex === -1) {
      lines.push({ line: movesStr, variations: [] });
      break;
    }

    const closingParenIndex = findClosingParenIndex(movesStr, openingParenIndex);
    const firstHalf = movesStr.slice(0, openingParenIndex).trim();
    const variation = movesStr.slice(openingParenIndex + 1, closingParenIndex).trim();

    if (firstHalf)
      lines.push({ line: firstHalf, variations: [] });

    if (variation)
      lines.at(-1)?.variations?.push(...parseVariations(variation));

    movesStr = movesStr.slice(closingParenIndex + 1).trim();
  }

  return lines;
}

export interface PgnVariations {
  line: string;
  variations: PgnVariations[];
}