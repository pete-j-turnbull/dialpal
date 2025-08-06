import { Crons } from "@convex-dev/crons";
import { WorkflowManager } from "@convex-dev/workflow";
import { ActionRetrier } from "@convex-dev/action-retrier";
import { components } from "@convex/_generated/api";

export const crons = new Crons(components.crons);
export const workflow = new WorkflowManager(components.workflow);
export const retrier = new ActionRetrier(components.actionRetrier);
