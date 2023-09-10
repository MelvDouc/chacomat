
const findClosingParenIndex = createClosingCharIndexSearchFn("(", ")");
const findClosingCurlyBraceIndex = createClosingCharIndexSearchFn("{", "}");

function createClosingCharIndexSearchFn(openingChar: string, closingChar: string) {
  return (str: string, startIndex: number) => {
    for (let i = startIndex + 1, count = 1; i < str.length; i++) {
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

    throw new Error(`Bracket at index ${startIndex} in "${str}" is not closed.`);
  };
}

export function parseVariations(movesStr: string): PgnVariations[] {
  const lines: PgnVariations[] = [];

  while (movesStr.length) {
    if (movesStr[0] === "{") {
      const closingIndex = findClosingCurlyBraceIndex(movesStr, 0);
      lines[lines.length - 1].comment = movesStr.slice(1, closingIndex);
      movesStr = movesStr.slice(closingIndex + 1).trim();
      continue;
    }

    if (movesStr[0] === "(") {
      const closingIndex = findClosingParenIndex(movesStr, 0);
      lines[lines.length - 1].variations.push(movesStr.slice(1, closingIndex));
      movesStr = movesStr.slice(closingIndex + 1).trim();
      continue;
    }

    const nextIndex = Math.min(findIndex(movesStr, "{"), findIndex(movesStr, "("));
    lines.push({ line: movesStr.slice(0, nextIndex), variations: [] });
    movesStr = movesStr.slice(nextIndex).trim();
  }

  return lines;
}
// ".... ().....{}().....()"
// ".... ().....{}().....()...."

function findIndex(str: string, char: string) {
  const index = str.indexOf(char);
  return index !== -1 ? index : str.length;
}

export interface PgnVariations {
  line: string;
  variations: string[];
  comment?: string;
}