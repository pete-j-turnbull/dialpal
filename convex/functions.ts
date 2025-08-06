/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConvexError, PropertyValidators, v, Validator } from "convex/values";
import {
  customAction,
  customCtx,
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import {
  type QueryCtx,
  type MutationCtx,
  type ActionCtx,
  action as actionRaw,
  mutation as mutationRaw,
  query as queryRaw,
} from "@convex/_generated/server";
import { internal } from "@convex/_generated/api";
import { requireEnv } from "../env";
import { resolveContext as resolveAuthContext } from "./modules/auth";
import { type AuthContext } from "./modules/auth/types";
import {
  ArgsArrayForOptionalValidator,
  ArgsArrayToObject,
  DefaultArgsForOptionalValidator,
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  RegisteredAction,
  RegisteredMutation,
  RegisteredQuery,
  ReturnValueForOptionalValidator,
} from "convex/server";
import { DataModel } from "./_generated/dataModel";

function getSharedSecret() {
  const {
    convex: { sharedSecret },
  } = requireEnv("convex");
  return sharedSecret;
}

async function withAuthContext(arg: {
  ctx: QueryCtx | MutationCtx | ActionCtx;
}): Promise<AuthContext> {
  const { ctx } = arg;
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) throw new ConvexError("Not authenticated");
  if (!identity.emailVerified) throw new ConvexError("Email not verified");

  const clerkUserId = (identity.subject ?? undefined) as string | undefined;
  const clerkOrgId = (identity["org_id"] ?? undefined) as string | undefined;
  const isRoot = identity["is_root"] ? true : false;

  if ("db" in ctx) {
    return await resolveAuthContext(ctx, {
      clerkOrgId,
      clerkUserId,
      isRoot,
    });
  } else {
    return await ctx.runQuery(internal.modules.auth.index._resolveContext, {
      clerkOrgId,
      clerkUserId,
      isRoot,
    });
  }
}

async function withRootContext(arg: {
  ctx: QueryCtx | MutationCtx | ActionCtx;
}): Promise<AuthContext> {
  const { ctx } = arg;
  const authContext = await withAuthContext({ ctx });
  if (!authContext.isRoot) throw new Error("Unauthorized");

  return authContext;
}

export const protectedQuery = customQuery(
  queryRaw,
  customCtx(async (ctx) => {
    return await withAuthContext({ ctx });
  })
);
export const protectedMutation = customMutation(
  mutationRaw,
  customCtx(async (ctx) => {
    return await withAuthContext({ ctx });
  })
);
export const protectedAction = customAction(
  actionRaw,
  customCtx(async (ctx) => {
    return await withAuthContext({ ctx });
  })
);

export const rootQuery = customQuery(
  queryRaw,
  customCtx(async (ctx) => {
    return await withRootContext({ ctx });
  })
);
export const rootMutation = customMutation(
  mutationRaw,
  customCtx(async (ctx) => {
    return await withRootContext({ ctx });
  })
);
export const rootAction = customAction(
  actionRaw,
  customCtx(async (ctx) => {
    return await withRootContext({ ctx });
  })
);

export const privateQuery = <
  ArgsValidator extends
    | PropertyValidators
    | Validator<any, "required", any>
    | void,
  ReturnsValidator extends
    | PropertyValidators
    | Validator<any, "required", any>
    | void,
  ReturnValue extends ReturnValueForOptionalValidator<ReturnsValidator> = any,
  OneOrZeroArgs extends ArgsArrayForOptionalValidator<ArgsValidator> = DefaultArgsForOptionalValidator<ArgsValidator>
>(query: {
  args?: ArgsValidator;
  returns?: ReturnsValidator;
  handler: (
    ctx: GenericQueryCtx<DataModel>,
    ...args: OneOrZeroArgs
  ) => ReturnValue;
}) => {
  const argsWithSecretKey = {
    secretKey: v.string(),
    ...query.args,
  };

  return queryRaw({
    args: argsWithSecretKey,
    handler: async (ctx, args) => {
      const { secretKey, ...argsWithoutSecretKey } = args;

      if (!secretKey || secretKey !== getSharedSecret()) {
        throw new ConvexError("Invalid secret key");
      }

      return await query.handler(
        ctx,
        ...([argsWithoutSecretKey] as unknown as OneOrZeroArgs)
      );
    },
  }) as RegisteredQuery<
    "public",
    ArgsArrayToObject<OneOrZeroArgs>,
    ReturnValue
  >;
};

export const privateMutation = <
  ArgsValidator extends
    | PropertyValidators
    | Validator<any, "required", any>
    | void,
  ReturnsValidator extends
    | PropertyValidators
    | Validator<any, "required", any>
    | void,
  ReturnValue extends ReturnValueForOptionalValidator<ReturnsValidator> = any,
  OneOrZeroArgs extends ArgsArrayForOptionalValidator<ArgsValidator> = DefaultArgsForOptionalValidator<ArgsValidator>
>(mutation: {
  args?: ArgsValidator;
  returns?: ReturnsValidator;
  handler: (
    ctx: GenericMutationCtx<DataModel>,
    ...args: OneOrZeroArgs
  ) => ReturnValue;
}) => {
  const argsWithSecretKey = {
    secretKey: v.string(),
    ...mutation.args,
  };

  return mutationRaw({
    args: argsWithSecretKey,
    handler: async (ctx, args) => {
      const { secretKey, ...argsWithoutSecretKey } = args;

      if (!secretKey || secretKey !== getSharedSecret()) {
        throw new ConvexError("Invalid secret key");
      }

      return await mutation.handler(
        ctx,
        ...([argsWithoutSecretKey] as unknown as OneOrZeroArgs)
      );
    },
  }) as RegisteredMutation<
    "public",
    ArgsArrayToObject<OneOrZeroArgs>,
    ReturnValue
  >;
};

export const privateAction = <
  ArgsValidator extends
    | PropertyValidators
    | Validator<any, "required", any>
    | void,
  ReturnsValidator extends
    | PropertyValidators
    | Validator<any, "required", any>
    | void,
  ReturnValue extends ReturnValueForOptionalValidator<ReturnsValidator> = any,
  OneOrZeroArgs extends ArgsArrayForOptionalValidator<ArgsValidator> = DefaultArgsForOptionalValidator<ArgsValidator>
>(func: {
  args?: ArgsValidator;
  returns?: ReturnsValidator;
  handler: (
    ctx: GenericActionCtx<DataModel>,
    ...args: OneOrZeroArgs
  ) => ReturnValue;
}) => {
  const argsWithSecretKey = {
    secretKey: v.string(),
    ...func.args,
  };

  return actionRaw({
    args: argsWithSecretKey,
    handler: async (ctx, args) => {
      const { secretKey, ...argsWithoutSecretKey } = args;

      if (!secretKey || secretKey !== getSharedSecret()) {
        throw new ConvexError("Invalid secret key");
      }

      return await func.handler(
        ctx,
        ...([argsWithoutSecretKey] as unknown as OneOrZeroArgs)
      );
    },
  }) as RegisteredAction<
    "public",
    ArgsArrayToObject<OneOrZeroArgs>,
    ReturnValue
  >;
};

export {
  internalQuery,
  internalMutation,
  internalAction,
  httpAction,
} from "@convex/_generated/server";

export {
  queryRaw as publicQuery,
  mutationRaw as publicMutation,
  actionRaw as publicAction,
};

export type { QueryCtx, MutationCtx, ActionCtx };
