import { type FunctionReference } from "convex/server";
import { ConvexHttpClient } from "convex/browser";
import { requireEnv } from "../../../env";

export class Convex {
  private _client?: ConvexHttpClient;
  private _sharedSecret?: string;

  private ensureClient(): ConvexHttpClient {
    if (!this._client) {
      const env = requireEnv("convex");

      this._client = new ConvexHttpClient(env.convex.cloudUrl);
      this._sharedSecret = env.convex.sharedSecret;
    }

    return this._client;
  }

  async query<Query extends FunctionReference<"query">>(
    query: Query,
    args: Query["_args"]
  ) {
    const client = this.ensureClient();
    console.log(this._sharedSecret);
    const argsWithSharedSecret = { ...args, secretKey: this._sharedSecret };

    return client.query(query, argsWithSharedSecret);
  }

  async mutation<Mutation extends FunctionReference<"mutation">>(
    mutation: Mutation,
    args: Mutation["_args"]
  ) {
    const client = this.ensureClient();
    const argsWithSharedSecret = { ...args, secretKey: this._sharedSecret };

    return client.mutation(mutation, argsWithSharedSecret);
  }

  async action<Action extends FunctionReference<"action">>(
    action: Action,
    args: Action["_args"]
  ) {
    const client = this.ensureClient();
    const argsWithSharedSecret = { ...args, secretKey: this._sharedSecret };

    return client.action(action, argsWithSharedSecret);
  }
}
