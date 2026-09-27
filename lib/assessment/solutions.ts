import * as arrays from "@/lib/assessment/challenges-solutions/arrays/solution.js";
import * as functions from "@/lib/assessment/challenges-solutions/functions/solution.js";
import * as objects from "@/lib/assessment/challenges-solutions/objects/solution.js";

export type Solution = {
  code: string;
  explanation: string;
};

export const solutionsById: Record<number, Solution> = {
  1: arrays,
  2: functions,
  3: objects,
};
