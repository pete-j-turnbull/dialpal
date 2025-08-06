"use node";

import { requireEnv } from "../../../env";
import { JSON_VALUE_KEY } from "./const";
import { marshal, unmarshal } from "./json";
import { RedisClient } from "./redis";

export class Cache {
  private redisClient?: RedisClient;

  private ensureClient() {
    if (!this.redisClient) {
      const env = requireEnv("cache");
      this.redisClient = new RedisClient(env.cache);
    }

    return this.redisClient.isAvailable ? this.redisClient : undefined;
  }

  public async get<T>(key: string): Promise<T | undefined> {
    const client = this.ensureClient();

    const cacheVal = (await client?.get({ key })) ?? null;
    return cacheVal ? (this._unmarshallValue(cacheVal) as T) : undefined;
  }

  public async getOrFetch<T>(arg: {
    key: string;
    ttl: number;
    fetch: () => Promise<T>;
    refresh?: boolean;
  }): Promise<T> {
    const client = this.ensureClient();

    const { key, ttl, refresh, fetch } = arg;
    let cacheVal: string | null = refresh
      ? null
      : (await client?.get({ key })) ?? null;
    if (!cacheVal) {
      const value = await fetch();
      cacheVal = this._marshallValue(value);
      if (value !== undefined) {
        // only cache if value is not undefined
        await client?.set({ key, value: cacheVal, ttl });
      }
    }
    return this._unmarshallValue(cacheVal) as T;
  }

  public async set<T>(arg: { key: string; value: T; ttl: number }) {
    const client = this.ensureClient();

    const { key, value, ttl } = arg;
    const cacheVal = this._marshallValue(value);
    await client?.set({ key, value: cacheVal, ttl });
  }

  public async del(keys: string | string[]) {
    const client = this.ensureClient();

    // RedisClient throws exception with empty keys, causing store.models.update to fail
    if (keys.length === 0) {
      return;
    }

    await client?.del(keys);
  }

  /**
   * Example: delWildcard('my-prefix:*')
   * @param wildcard - a wildcard string to match keys to delete
   */
  public async delWildcard(wildcard: string) {
    const client = this.ensureClient();

    // get keys that match the prefix
    const keys = await client?.keys(wildcard);

    // RedisClient throws exception with empty keys, causing store.models.update to fail
    if (keys && keys.length > 0) {
      // delete the keys
      await client?.del(keys);
    }
  }

  public async flush() {
    const client = this.ensureClient();

    await client?.flush();
  }

  /**
   * ----- Private -----
   */

  private _marshallValue(value: any): string {
    return marshal({ [JSON_VALUE_KEY]: value });
  }
  private _unmarshallValue(value: string): any {
    const parsedValue = unmarshal(value);
    return parsedValue[JSON_VALUE_KEY];
  }
}
