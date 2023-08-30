import { strictEqual } from "node:assert";
import { test } from "node:test";

function expect(actual) {
  let positive = true;

  const testMethods = {
    get not() {
      positive = false;
      return testMethods;
    },
    true: () => strictEqual(actual, positive),
    false: () => strictEqual(actual, !positive),
    nullish: () => strictEqual(actual == null, positive),
    toBe: (expected) => strictEqual(Object.is(actual, expected), positive),
    toContain: (value) => {
      if (typeof actual?.values === "function") {
        strictEqual([...actual.values()].includes(value), positive);
        return;
      }

      throw new Error("toContain used on non-array-like value.");
    },
    every: (predicate) => strictEqual(actual.every(predicate), positive),
    some: (predicate) => strictEqual(actual.some(predicate), positive),
    count: (expectedCount, predicate) => {
      let count = 0;
      for (const element of actual.values())
        if (predicate(element))
          count++;

      strictEqual(count === expectedCount, positive);
    }
  };

  return testMethods;
}

export {
  expect,
  test
};
