import { PgnVariations } from "@chacomat/types.local.js";

const moveRegex = /\d+\.{1,3}/g;

const Parenthesis = {
  START: "(",
  END: ")"
} as const;

/**
 * Yield every full move substring (e.g. "1... c5") one at a time.
 */
export function* parsedMoves(movesStr: string) {
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
export function parseVariations(movesStr: string): PgnVariations {
  const variations: PgnVariations[] = [];
  let startIndex = movesStr.indexOf(Parenthesis.START);

  while (startIndex !== -1) {
    const endIndex = findClosingParenIndex(movesStr, startIndex);
    if (movesStr[endIndex] !== Parenthesis.END)
      throw new Error(`Unclosed parenthesis at ${movesStr.slice(startIndex, 10)} ...`);

    const varText = movesStr.slice(startIndex + 1, endIndex);
    variations.push(parseVariations(varText));

    movesStr = `${movesStr.slice(0, startIndex - 1)} ${movesStr.slice(endIndex + 1)}`.replace(/\s+/g, " ");
    startIndex = movesStr.indexOf(Parenthesis.START);
  }

  return (variations.length)
    ? { movesAsString: movesStr, variations }
    : { movesAsString: movesStr };
}

function findClosingParenIndex(str: string, firstParenIndex: number): number {
  for (let i = firstParenIndex + 1, count = 1; i < str.length; i++) {
    if (str[i] === Parenthesis.START) {
      count++;
      continue;
    }
    if (str[i] === Parenthesis.END) {
      count--;
      if (count === 0)
        return i;
    }
  }

  return -1;
}