import {
  assert,
  assertArrayIncludes,
  assertEquals,
  assertFalse,
  assertGreater,
  assertLess,
  assertNotEquals,
  assertStringIncludes,
} from "@dev_deps";

function assertArray<T>(arr: T[]) {
  return {
    count: (predicate: (element: T, index: number) => boolean, message?: string) => {
      assert(arr.reduce((acc, item, index) => acc + Number(predicate(item, index)), 0), message);
    },
    every: (predicate: (element: T, index: number) => boolean, message?: string) => {
      assert(arr.every(predicate), message);
    },
  };
}

function assertNullish(value: unknown, message?: string) {
  assert(value == null, message);
}

export {
  assert, assertArray, assertArrayIncludes, assertEquals,
  assertFalse,
  assertGreater,
  assertLess, assertNotEquals, assertNullish, assertStringIncludes
};
