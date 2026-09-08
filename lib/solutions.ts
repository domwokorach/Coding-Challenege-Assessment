import * as arrays from "@/lib/challenges/arrays/solution.js";
import * as functions from "@/lib/challenges/functions/solution.js";
import * as objects from "@/lib/challenges/objects/solution.js";

export type Solution = {
  code: string;
  explanation: string;
};

export const solutionsById: Record<number, Solution> = {
  1: arrays,
  2: functions,
  3: objects,
};
