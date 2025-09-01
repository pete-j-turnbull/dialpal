import { DiffOp } from "@convex/schema/document";

export type ExtensionState = {
  oldText?: string;
  oldHash?: string;
  newText?: string;
  newHash?: string;
  ops: DiffOp[];
};
