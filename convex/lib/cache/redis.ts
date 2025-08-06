"use node";

import { createClient } from "redis";
import { onShutdown } from "./shutdown";

export class RedisClient {
  private client: ReturnType<typeof createClient>;
  private healthy = true;

  constructor(config: {
    host: string;
    port: number;
    user: string;
    pass: string;
  }) {
    this.client = createClient({
      socket: {
        host: config.host,
        port: config.port,
        connectTimeout: 8000,
        tls: config.pass !== "" ? true : undefined,
      },
      username: config.user,
      password: config.pass,
    });
    this.initialise();
    onShutdown(async () => {
      await this.quit();
    });
  }

  public async awaitConnection(): Promise<boolean> {
    let available = this.isAvailable;
    let attempts = 0;
    while (!available && attempts < 100) {
      attempts++;
      available = this.isAvailable;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    return this.isAvailable;
  }

  public get isAvailable(): boolean {
    return Boolean(this.healthy);
  }

  public async get(arg: { key: string }): Promise<string | null> {
    const { key } = arg;

    if (!this.isAvailable) {
      return null;
    }

    let cacheVal: string | null = null;
    try {
      cacheVal = (await this.client.get(key)) ?? null;
    } catch (err) {
      if (err instanceof Error) {
        console.error(`Redis error [GET]: ${err.message}`, {
          ...err,
          message: err.message,
          stack: err.stack,
        });
      } else {
        throw err;
      }
    }

    return cacheVal;
  }

  public async set(arg: { key: string; value: string; ttl: number }) {
    const { key, value, ttl } = arg;
    if (this.isAvailable) {
      await this.client.set(key, value, {
        EX: ttl,
      });
    }
  }

  public async del(keys: string | string[]) {
    if (this.isAvailable) {
      await this.client.del(keys);
    }
  }

  public async keys(pattern: string): Promise<string[]> {
    if (!this.isAvailable) {
      return [];
    }
    const found: string[] = [];
    let cursor = "0";
    console.time("redis scan");
    do {
      const reply = await this.client.scan(cursor, {
        MATCH: pattern,
        TYPE: "string",
        COUNT: 100,
      });
      cursor = reply.cursor;
      found.push(...reply.keys);
    } while (cursor !== "0");
    console.timeEnd("redis scan");
    return found;
  }

  public async flush() {
    if (this.isAvailable) {
      await this.client.flushDb();
    }
  }

  public async quit() {
    // used by cloud functions to ensure the connection is closed
    try {
      await this.client.quit();
    } catch (err) {
      if (err instanceof Error) {
        if (
          !["Connection is closed", "The client is closed"].includes(
            err.message
          )
        ) {
          console.error(`Redis error [QUIT]: ${err.message}`, {
            ...err,
            message: err.message,
            stack: err.stack,
          });
        }
      } else {
        throw err;
      }
    }
  }

  private async initialise() {
    this.client.on("connect", () => {
      // this.logger.debug(`RedisClient - Initiating a connection to the server`);
    });
    this.client.on("reconnecting", () => {
      console.debug(
        `RedisClient - Client is trying to reconnect to the server...`
      );
      this.healthy = false;
    });
    this.client.on("ready", () => {
      // this.logger.debug(`RedisClient - Client is ready to use`);
      this.healthy = true;
    });
    this.client.on("error", (error: Error) => {
      console.error(`RedisClient error: ${error.message}`, {
        ...error,
        message: error.message,
        stack: error.stack,
      });
    });
    this.client.on("end", () => {
      console.debug(`RedisClient connection closed`);
    });

    await this.client.connect();
  }
}
