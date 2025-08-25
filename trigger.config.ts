import { defineConfig } from "@trigger.dev/sdk";

const TRIGGER_PROJECT_REF = "proj_pqimsslcnhaypclobhqt";

export default defineConfig({
  project: TRIGGER_PROJECT_REF,
  runtime: "node",
  logLevel: "log",
  // The max compute seconds a task is allowed to run. If the task run exceeds this duration, it will be stopped.
  // You can override this on an individual task.
  // See https://trigger.dev/docs/runs/max-duration
  maxDuration: 3600,
  machine: "small-2x",
  build: {
    extensions: [],
    external: [],
  },
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./convex/**/trigger/**"],
});
