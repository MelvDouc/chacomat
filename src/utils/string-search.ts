export const findClosingParenIndex = findMatchingCharIndex("(", ")");
export const findClosingCurlyIndex = findMatchingCharIndex("{", "}");

function findMatchingCharIndex(char1: string, char2: string) {
  return (input: string, startIndex = 0) => {
    for (let i = startIndex, count = 0; i < input.length; i++) {
      if (input[i] === char1) {
        count++;
        continue;
      }

      if (input[i] === char2) {
        count--;

        if (count === 0)
          return i;
      }
    }

    throw new Error(`Unclosed ${char1} in string "${input}".`);
  };
}

export function findNextBracketIndex(input: string) {
  let i = 0;

  while (i < input.length) {
    if (input[i] === "(" || input[i] === "{")
      break;
    i++;
  }

  return i;
}