export interface PgnVariations {
  movesAsString: string;
  variations?: PgnVariations[];
}

const moveRegex = /\d+\.{1,3}/g;

/**
 * Yield every full move substring (e.g. "1... c5") one at a time.
 */
export function* splitHalfMoveSubstrings(movesStr: string) {
  yield* [...movesStr.matchAll(moveRegex)]
    .map((x, i, arr) => {
      const endIndex = (arr[i + 1] != null) ? arr[i + 1].index - 1 : movesStr.length;
      return movesStr.slice(x.index, endIndex);
    })
    .values();
}

/**
 * Turn a moves string that includes variations into a recursive record.
 */
export function getMovesPortionAndVariations(movesStr: string): PgnVariations {
  const variations: PgnVariations[] = [];
  let startIndex: number;

  while ((startIndex = movesStr.indexOf("(")) !== -1) {
    const endIndex = findClosingParenIndex(movesStr, startIndex);
    const varText = movesStr.slice(startIndex + 1, endIndex);
    variations.push(getMovesPortionAndVariations(varText));

    movesStr = `${movesStr.slice(0, startIndex - 1)} ${movesStr.slice(endIndex + 1)}`.replace(/\s+/g, " ");
  }

  return (variations.length)
    ? { movesAsString: movesStr, variations }
    : { movesAsString: movesStr };
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