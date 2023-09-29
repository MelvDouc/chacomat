export const findClosingParenIndex = createClosingCharIndexSearchFn("(", ")");
export const findClosingCurlyBraceIndex = createClosingCharIndexSearchFn("{", "}");

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