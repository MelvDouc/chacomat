/**
 * @param {any[]} arr
 * @param {(item: typeof arr[number], i: number, arr: typeof arr) => boolean} predicate
 * @returns {number}
 */
export function count(arr, predicate) {
  return arr.reduce((acc, element, i) => {
    return acc + Number(predicate(element, i, arr));
  }, 0);
}