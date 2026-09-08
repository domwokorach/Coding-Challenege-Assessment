import * as arrays from "@/src/challenges/arrays/solution.js";
import * as functions from "@/src/challenges/functions/solution.js";
import * as objects from "@/src/challenges/objects/solution.js";

export type Solution = {
  code: string;
  explanation: string;
};

export const solutionsById: Record<number, Solution> = {
  1: arrays,
  2: functions,
  3: objects,
};
