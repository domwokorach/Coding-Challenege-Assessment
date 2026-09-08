export type TestOutcome = {
  label: string;
  pass: boolean;
  expected: unknown;
  received: unknown;
};

type TestCase = {
  label: string;
  run: (fn: (...args: unknown[]) => unknown) => {
    pass: boolean;
    expected: unknown;
    received: unknown;
  };
};

export type Challenge = {
  id: number;
  category: string;
  title: string;
  description: string;
  requirements: string[];
  functionName: string;
  starterCode: string;
  browserInput: string;
  browserExpected: string;
  tests: TestCase[];
};

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

function check(received: unknown, expected: unknown) {
  return { pass: deepEqual(received, expected), expected, received };
}

export function formatValue(value: unknown): string {
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "function") {
    return value.name ? `[Function: ${value.name}]` : "[Function]";
  }
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function extractFunction(code: string, name: string) {
  // Evaluating the candidate's own code is the whole point of the test
  // runner — there's no way to turn source text into a callable function
  // without it.
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const factory = new Function(
    `"use strict";\n${code}\n;return (typeof ${name} !== "undefined") ? ${name} : undefined;`
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- factory() returns unknown by construction
  const fn: unknown = factory();
  if (typeof fn !== "function") {
    throw new Error(`"${name}" is not defined as a function`);
  }
  return fn as (...args: unknown[]) => unknown;
}

export function runChallengeTests(
  challenge: Challenge,
  code: string
): { outcomes: TestOutcome[]; error: string | null } {
  let fn: (...args: unknown[]) => unknown;
  try {
    fn = extractFunction(code, challenge.functionName);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      outcomes: challenge.tests.map((test) => ({
        label: test.label,
        pass: false,
        expected: undefined,
        received: undefined,
      })),
      error: message,
    };
  }

  const outcomes = challenge.tests.map((test) => {
    try {
      const result = test.run(fn);
      return { label: test.label, ...result };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        label: test.label,
        pass: false,
        expected: undefined,
        received: `Error: ${message}`,
      };
    }
  });

  return { outcomes, error: null };
}

export const challenges: Challenge[] = [
  {
    id: 1,
    category: "Arrays",
    title: "Sum Numbers",
    description:
      "Create a function that calculates the sum of all numbers in an array.",
    requirements: [
      "Accept an array of numbers",
      "Return the total",
      "Do not hard-code the result",
    ],
    functionName: "sumNumbers",
    starterCode: `function sumNumbers(numbers) {
  // Write your solution here
}

console.log(sumNumbers([1, 2, 3, 4, 5]));
`,
    browserInput: "[1, 2, 3, 4, 5]",
    browserExpected: "15",
    tests: [
      { label: "Test 1", run: (fn) => check(fn([1, 2, 3, 4, 5]), 15) },
      { label: "Test 2", run: (fn) => check(fn([10, 20, 30]), 60) },
      { label: "Test 3", run: (fn) => check(fn([-5, 5]), 0) },
      { label: "Test 4", run: (fn) => check(fn([]), 0) },
    ],
  },
  {
    id: 2,
    category: "Functions",
    title: "Function Return Type",
    description:
      "Create a function that identifies the type of a value and returns it as a string.",
    requirements: [
      "Accept one value as a parameter",
      "Return the JavaScript type of that value",
      "Use the typeof operator",
      "Return the result rather than only logging it",
    ],
    functionName: "getValueType",
    starterCode: `function getValueType(value) {
  // Write your solution here
}

console.log(getValueType("Hello"));
`,
    browserInput: `"Hello"`,
    browserExpected: `"string"`,
    tests: [
      { label: "String test", run: (fn) => check(fn("Hello"), "string") },
      { label: "Number test", run: (fn) => check(fn(42), "number") },
      { label: "Boolean test", run: (fn) => check(fn(true), "boolean") },
      {
        label: "Function test",
        run: (fn) => check(fn(function () {}), "function"),
      },
    ],
  },
  {
    id: 3,
    category: "Objects",
    title: "Todo Task",
    description: "Create a JavaScript object representing a todo task.",
    requirements: [
      "Accept title as a function parameter",
      "Set the object's title property using that parameter",
      "New tasks must have completed set to false",
      "Return the completed object",
    ],
    functionName: "createTodo",
    starterCode: `function createTodo(title) {
  // Write your solution here
}

console.log(createTodo("Learn JavaScript"));
`,
    browserInput: `"Learn JavaScript"`,
    browserExpected: `{
  title: "Learn JavaScript",
  completed: false
}`,
    tests: [
      {
        label: "Todo object created",
        run: (fn) => check(typeof fn("Learn JavaScript"), "object"),
      },
      {
        label: "Title is correct",
        run: (fn) =>
          check(
            (fn("Learn JavaScript") as { title: unknown }).title,
            "Learn JavaScript"
          ),
      },
      {
        label: "Completed status is false",
        run: (fn) =>
          check(
            (fn("Learn JavaScript") as { completed: unknown }).completed,
            false
          ),
      },
      {
        label: "Function works with different task titles",
        run: (fn) =>
          check(
            (fn("Build a project") as { title: unknown }).title,
            "Build a project"
          ),
      },
    ],
  },
];
