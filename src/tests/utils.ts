export function count<T>(arr: T[], predicate: (element: T, index: number, arr: T[]) => boolean) {
  return arr.filter(predicate).length;
}