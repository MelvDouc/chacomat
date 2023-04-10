export default function parseVariations(movesStr: string): PgnVariations {
  movesStr = movesStr.trim();
  const variations: PgnVariations["variations"] = [];
  let openingParenIndex: number;

  while ((openingParenIndex = movesStr.indexOf("(")) !== -1) {
    const closingParenIndex = findClosingParenIndex(movesStr, openingParenIndex);
    const varText = movesStr.slice(openingParenIndex + 1, closingParenIndex);
    variations.push(parseVariations(varText));
    movesStr = movesStr.slice(0, openingParenIndex) + movesStr.slice(closingParenIndex + 1);
  }

  return {
    mainLine: movesStr,
    variations
  };
}

function findClosingParenIndex(str: string, firstParenIndex: number): number {
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

interface PgnVariations {
  mainLine: string;
  variations: PgnVariations[];
}