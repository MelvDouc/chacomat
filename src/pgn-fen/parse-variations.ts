const halfMoveRegex = /(([a-h](x[a-h])?|[KQRBN][a-h]?[1-8]?x?[a-h])[1-8]|(0|O)(-(0|O)){1,2})/g;
const moveNumberRegex = /(?<moveNumber>\d+)\.(?<isBlack>\.\.)?/g;

export default function parseVariations(moveStr: string, memo: ParsedMove[][] = []): ParsedMove[][] {
  let firstParenIndex: number;

  while ((firstParenIndex = moveStr.indexOf("(")) !== -1) {
    const closingParentIndex = findClosingParenIndex(moveStr, firstParenIndex);
    parseVariations(moveStr.slice(firstParenIndex + 1, closingParentIndex), memo);
    moveStr = moveStr.slice(0, firstParenIndex) + moveStr.slice(closingParentIndex + 1);
  }

  memo.unshift(parseVariation(moveStr));
  return memo;
}

function parseVariation(varString: string): ParsedMove[] {
  return [...varString.matchAll(moveNumberRegex)].map((item, i, arr) => {
    const groups = item.groups ?? {};
    const isBlack = !!groups["isBlack"];
    const substring = varString.slice(item.index, arr[i + 1]?.index).trim();
    const [m1, m2] = substring.slice(item[0].length).match(halfMoveRegex) ?? [];

    return {
      moveNumber: Number(groups["moveNumber"]),
      whiteMove: isBlack ? null : m1,
      blackMove: isBlack ? m1 : m2
    };
  });
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

interface ParsedMove {
  moveNumber: number;
  whiteMove: string | null | undefined;
  blackMove: string | null | undefined;
}