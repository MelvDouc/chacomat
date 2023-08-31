export function count<T>(arr: T[], predicate: (element: T, index: number, arr: T[]) => boolean) {
  return arr.reduce((acc, element, i) => {
    return predicate(element, i, arr) ? acc + 1 : acc;
  }, 0);
}