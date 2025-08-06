import type { RunHandle, Task } from "@trigger.dev/sdk";

export type AnyTask = Task<string, any, any>;

export type InferTaskId<T extends AnyTask> = T extends Task<
  infer N,
  infer S,
  infer O
>
  ? N
  : never;

export type InferTaskOutput<T extends AnyTask> = T extends Task<
  infer N,
  infer S,
  infer O
>
  ? O
  : never;
export type InferTaskInput<T extends AnyTask> = T extends Task<
  infer N,
  infer S,
  infer O
>
  ? S
  : never;

export type InferTaskRunHandle<T extends AnyTask> = T extends Task<
  infer N,
  infer S,
  infer O
>
  ? RunHandle<N, S, O>
  : never;
