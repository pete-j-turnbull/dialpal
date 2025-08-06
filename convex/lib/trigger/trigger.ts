import { requireEnv } from "../../../env";
import {
  AnyTask,
  InferTaskId,
  InferTaskInput,
  InferTaskRunHandle,
} from "./types";

export class Trigger {
  private secretKey?: string;

  private ensureSecretKey(): string {
    if (!this.secretKey) {
      this.secretKey = requireEnv("trigger").trigger.secretKey;
    }

    return this.secretKey;
  }

  public async runTask<T extends AnyTask>(
    taskIdentifier: InferTaskId<T>,
    payload: InferTaskInput<T>
  ): Promise<InferTaskRunHandle<T>> {
    const secretKey = this.ensureSecretKey();
    const encodedTaskIdentifier = encodeURIComponent(taskIdentifier);

    try {
      const response = await fetch(
        `https://api.trigger.dev/api/v1/tasks/${encodedTaskIdentifier}/trigger`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }
}
