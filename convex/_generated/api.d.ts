/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as components_ from "../components.js";
import type * as functions from "../functions.js";
import type * as http_clerk from "../http/clerk.js";
import type * as http from "../http.js";
import type * as lib_cache_cache from "../lib/cache/cache.js";
import type * as lib_cache_const from "../lib/cache/const.js";
import type * as lib_cache_index from "../lib/cache/index.js";
import type * as lib_cache_json from "../lib/cache/json.js";
import type * as lib_cache_redis from "../lib/cache/redis.js";
import type * as lib_cache_shutdown from "../lib/cache/shutdown.js";
import type * as lib_claude_claude from "../lib/claude/claude.js";
import type * as lib_claude_const from "../lib/claude/const.js";
import type * as lib_claude_index from "../lib/claude/index.js";
import type * as lib_claude_types from "../lib/claude/types.js";
import type * as lib_clerk_clerk from "../lib/clerk/clerk.js";
import type * as lib_clerk_const from "../lib/clerk/const.js";
import type * as lib_clerk_index from "../lib/clerk/index.js";
import type * as lib_clerk_types from "../lib/clerk/types.js";
import type * as lib_convex_convex from "../lib/convex/convex.js";
import type * as lib_convex_index from "../lib/convex/index.js";
import type * as lib_trigger_index from "../lib/trigger/index.js";
import type * as lib_trigger_trigger from "../lib/trigger/trigger.js";
import type * as lib_trigger_types from "../lib/trigger/types.js";
import type * as migration from "../migration.js";
import type * as modules_auth_index from "../modules/auth/index.js";
import type * as modules_auth_internal from "../modules/auth/internal.js";
import type * as modules_auth_types from "../modules/auth/types.js";
import type * as modules_document_errors from "../modules/document/errors.js";
import type * as modules_document_index from "../modules/document/index.js";
import type * as modules_document_protected from "../modules/document/protected.js";
import type * as modules_document_schemas from "../modules/document/schemas.js";
import type * as modules_user_index from "../modules/user/index.js";
import type * as modules_user_internal from "../modules/user/internal.js";
import type * as modules_user_private from "../modules/user/private.js";
import type * as modules_user_protected from "../modules/user/protected.js";
import type * as modules_user_schemas from "../modules/user/schemas.js";
import type * as schema_document from "../schema/document.js";
import type * as schema_user from "../schema/user.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  components: typeof components_;
  functions: typeof functions;
  "http/clerk": typeof http_clerk;
  http: typeof http;
  "lib/cache/cache": typeof lib_cache_cache;
  "lib/cache/const": typeof lib_cache_const;
  "lib/cache/index": typeof lib_cache_index;
  "lib/cache/json": typeof lib_cache_json;
  "lib/cache/redis": typeof lib_cache_redis;
  "lib/cache/shutdown": typeof lib_cache_shutdown;
  "lib/claude/claude": typeof lib_claude_claude;
  "lib/claude/const": typeof lib_claude_const;
  "lib/claude/index": typeof lib_claude_index;
  "lib/claude/types": typeof lib_claude_types;
  "lib/clerk/clerk": typeof lib_clerk_clerk;
  "lib/clerk/const": typeof lib_clerk_const;
  "lib/clerk/index": typeof lib_clerk_index;
  "lib/clerk/types": typeof lib_clerk_types;
  "lib/convex/convex": typeof lib_convex_convex;
  "lib/convex/index": typeof lib_convex_index;
  "lib/trigger/index": typeof lib_trigger_index;
  "lib/trigger/trigger": typeof lib_trigger_trigger;
  "lib/trigger/types": typeof lib_trigger_types;
  migration: typeof migration;
  "modules/auth/index": typeof modules_auth_index;
  "modules/auth/internal": typeof modules_auth_internal;
  "modules/auth/types": typeof modules_auth_types;
  "modules/document/errors": typeof modules_document_errors;
  "modules/document/index": typeof modules_document_index;
  "modules/document/protected": typeof modules_document_protected;
  "modules/document/schemas": typeof modules_document_schemas;
  "modules/user/index": typeof modules_user_index;
  "modules/user/internal": typeof modules_user_internal;
  "modules/user/private": typeof modules_user_private;
  "modules/user/protected": typeof modules_user_protected;
  "modules/user/schemas": typeof modules_user_schemas;
  "schema/document": typeof schema_document;
  "schema/user": typeof schema_user;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
