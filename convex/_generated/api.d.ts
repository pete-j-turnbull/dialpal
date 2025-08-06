/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as components_ from "../components.js";
import type * as functions from "../functions.js";
import type * as http_clerk from "../http/clerk.js";
import type * as http_upload from "../http/upload.js";
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
import type * as lib_cloudglue_cloudglue from "../lib/cloudglue/cloudglue.js";
import type * as lib_cloudglue_index from "../lib/cloudglue/index.js";
import type * as lib_cloudglue_types from "../lib/cloudglue/types.js";
import type * as lib_convex_convex from "../lib/convex/convex.js";
import type * as lib_convex_index from "../lib/convex/index.js";
import type * as lib_elevenlabs_elevenlabs from "../lib/elevenlabs/elevenlabs.js";
import type * as lib_elevenlabs_index from "../lib/elevenlabs/index.js";
import type * as lib_elevenlabs_types from "../lib/elevenlabs/types.js";
import type * as lib_ffmpeg_ffmpeg from "../lib/ffmpeg/ffmpeg.js";
import type * as lib_ffmpeg_index from "../lib/ffmpeg/index.js";
import type * as lib_heygen_const from "../lib/heygen/const.js";
import type * as lib_heygen_heygen from "../lib/heygen/heygen.js";
import type * as lib_heygen_index from "../lib/heygen/index.js";
import type * as lib_heygen_types from "../lib/heygen/types.js";
import type * as lib_pexels_index from "../lib/pexels/index.js";
import type * as lib_pexels_pexels from "../lib/pexels/pexels.js";
import type * as lib_pexels_types from "../lib/pexels/types.js";
import type * as lib_r2_index from "../lib/r2/index.js";
import type * as lib_r2_r2 from "../lib/r2/r2.js";
import type * as lib_render_engine_engine from "../lib/render_engine/engine.js";
import type * as lib_render_engine_index from "../lib/render_engine/index.js";
import type * as lib_render_engine_types from "../lib/render_engine/types.js";
import type * as lib_trigger_index from "../lib/trigger/index.js";
import type * as lib_trigger_trigger from "../lib/trigger/trigger.js";
import type * as lib_trigger_types from "../lib/trigger/types.js";
import type * as migration from "../migration.js";
import type * as modules_admin_protected from "../modules/admin/protected.js";
import type * as modules_auth_clerk from "../modules/auth/clerk.js";
import type * as modules_auth_index from "../modules/auth/index.js";
import type * as modules_auth_types from "../modules/auth/types.js";
import type * as modules_common_trigger_index from "../modules/common/trigger/index.js";
import type * as modules_flows_frontend from "../modules/flows/frontend.js";
import type * as modules_flows_raw_const from "../modules/flows/raw/const.js";
import type * as modules_flows_raw_index from "../modules/flows/raw/index.js";
import type * as modules_flows_raw_schemas from "../modules/flows/raw/schemas.js";
import type * as modules_flows_raw_trigger_index from "../modules/flows/raw/trigger/index.js";
import type * as modules_flows_thought_leadership_169_const from "../modules/flows/thought_leadership_169/const.js";
import type * as modules_flows_thought_leadership_169_helpers from "../modules/flows/thought_leadership_169/helpers.js";
import type * as modules_flows_thought_leadership_169_index from "../modules/flows/thought_leadership_169/index.js";
import type * as modules_flows_thought_leadership_169_prompts_generate_template from "../modules/flows/thought_leadership_169/prompts/generate_template.js";
import type * as modules_flows_thought_leadership_169_schemas from "../modules/flows/thought_leadership_169/schemas.js";
import type * as modules_flows_thought_leadership_169_trigger_index from "../modules/flows/thought_leadership_169/trigger/index.js";
import type * as modules_flows_thought_leadership_916_const from "../modules/flows/thought_leadership_916/const.js";
import type * as modules_flows_thought_leadership_916_helpers from "../modules/flows/thought_leadership_916/helpers.js";
import type * as modules_flows_thought_leadership_916_index from "../modules/flows/thought_leadership_916/index.js";
import type * as modules_flows_thought_leadership_916_prompts_generate_template from "../modules/flows/thought_leadership_916/prompts/generate_template.js";
import type * as modules_flows_thought_leadership_916_schemas from "../modules/flows/thought_leadership_916/schemas.js";
import type * as modules_flows_thought_leadership_916_trigger_index from "../modules/flows/thought_leadership_916/trigger/index.js";
import type * as modules_flows_trigger_index from "../modules/flows/trigger/index.js";
import type * as modules_insights_helpers from "../modules/insights/helpers.js";
import type * as modules_insights_index from "../modules/insights/index.js";
import type * as modules_insights_prompts_generate_content_pillars from "../modules/insights/prompts/generate_content_pillars.js";
import type * as modules_insights_schemas from "../modules/insights/schemas.js";
import type * as modules_insights_trigger_index from "../modules/insights/trigger/index.js";
import type * as modules_organization_index from "../modules/organization/index.js";
import type * as modules_organization_internal from "../modules/organization/internal.js";
import type * as modules_organization_private from "../modules/organization/private.js";
import type * as modules_organization_schemas from "../modules/organization/schemas.js";
import type * as modules_rendered_video_index from "../modules/rendered_video/index.js";
import type * as modules_rendered_video_private from "../modules/rendered_video/private.js";
import type * as modules_rendered_video_schemas from "../modules/rendered_video/schemas.js";
import type * as modules_rendered_video_trigger_index from "../modules/rendered_video/trigger/index.js";
import type * as modules_resources_avatar_index from "../modules/resources/avatar/index.js";
import type * as modules_resources_avatar_private from "../modules/resources/avatar/private.js";
import type * as modules_resources_avatar_schemas from "../modules/resources/avatar/schemas.js";
import type * as modules_resources_avatar_trigger_index from "../modules/resources/avatar/trigger/index.js";
import type * as modules_resources_product_dataset_helpers from "../modules/resources/product_dataset/helpers.js";
import type * as modules_resources_product_dataset_index from "../modules/resources/product_dataset/index.js";
import type * as modules_resources_product_dataset_prompts_search_clips from "../modules/resources/product_dataset/prompts/search_clips.js";
import type * as modules_resources_product_dataset_schemas from "../modules/resources/product_dataset/schemas.js";
import type * as modules_resources_product_dataset_trigger_index from "../modules/resources/product_dataset/trigger/index.js";
import type * as modules_upload_index from "../modules/upload/index.js";
import type * as modules_workspace_index from "../modules/workspace/index.js";
import type * as modules_workspace_schemas from "../modules/workspace/schemas.js";
import type * as private_flows_raw from "../private/flows/raw.js";
import type * as private_flows_thought_leadership_169 from "../private/flows/thought_leadership_169.js";
import type * as private_flows_thought_leadership_916 from "../private/flows/thought_leadership_916.js";
import type * as private_insights from "../private/insights.js";
import type * as private_organization from "../private/organization.js";
import type * as private_rendered_video from "../private/rendered_video.js";
import type * as private_resources_avatar from "../private/resources/avatar.js";
import type * as private_resources_product_dataset from "../private/resources/product_dataset.js";
import type * as private_workspace from "../private/workspace.js";
import type * as protected_admin_organization from "../protected/admin/organization.js";
import type * as protected_admin_resources_avatar from "../protected/admin/resources/avatar.js";
import type * as protected_admin_resources_product_dataset from "../protected/admin/resources/product_dataset.js";
import type * as protected_auth from "../protected/auth.js";
import type * as protected_flows_raw from "../protected/flows/raw.js";
import type * as protected_flows_thought_leadership_169 from "../protected/flows/thought_leadership_169.js";
import type * as protected_flows_thought_leadership_916 from "../protected/flows/thought_leadership_916.js";
import type * as protected_insights from "../protected/insights.js";
import type * as protected_rendered_video from "../protected/rendered_video.js";
import type * as protected_resources_avatar from "../protected/resources/avatar.js";
import type * as protected_resources_product_dataset from "../protected/resources/product_dataset.js";
import type * as protected_workspace from "../protected/workspace.js";
import type * as schema_common from "../schema/common.js";
import type * as schema_content_pillar from "../schema/content_pillar.js";
import type * as schema_flows from "../schema/flows.js";
import type * as schema_organization from "../schema/organization.js";
import type * as schema_rendered_video from "../schema/rendered_video.js";
import type * as schema_resources_avatar from "../schema/resources/avatar.js";
import type * as schema_resources_product_dataset from "../schema/resources/product_dataset.js";
import type * as schema_user from "../schema/user.js";
import type * as schema_workspace from "../schema/workspace.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

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
  "http/upload": typeof http_upload;
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
  "lib/cloudglue/cloudglue": typeof lib_cloudglue_cloudglue;
  "lib/cloudglue/index": typeof lib_cloudglue_index;
  "lib/cloudglue/types": typeof lib_cloudglue_types;
  "lib/convex/convex": typeof lib_convex_convex;
  "lib/convex/index": typeof lib_convex_index;
  "lib/elevenlabs/elevenlabs": typeof lib_elevenlabs_elevenlabs;
  "lib/elevenlabs/index": typeof lib_elevenlabs_index;
  "lib/elevenlabs/types": typeof lib_elevenlabs_types;
  "lib/ffmpeg/ffmpeg": typeof lib_ffmpeg_ffmpeg;
  "lib/ffmpeg/index": typeof lib_ffmpeg_index;
  "lib/heygen/const": typeof lib_heygen_const;
  "lib/heygen/heygen": typeof lib_heygen_heygen;
  "lib/heygen/index": typeof lib_heygen_index;
  "lib/heygen/types": typeof lib_heygen_types;
  "lib/pexels/index": typeof lib_pexels_index;
  "lib/pexels/pexels": typeof lib_pexels_pexels;
  "lib/pexels/types": typeof lib_pexels_types;
  "lib/r2/index": typeof lib_r2_index;
  "lib/r2/r2": typeof lib_r2_r2;
  "lib/render_engine/engine": typeof lib_render_engine_engine;
  "lib/render_engine/index": typeof lib_render_engine_index;
  "lib/render_engine/types": typeof lib_render_engine_types;
  "lib/trigger/index": typeof lib_trigger_index;
  "lib/trigger/trigger": typeof lib_trigger_trigger;
  "lib/trigger/types": typeof lib_trigger_types;
  migration: typeof migration;
  "modules/admin/protected": typeof modules_admin_protected;
  "modules/auth/clerk": typeof modules_auth_clerk;
  "modules/auth/index": typeof modules_auth_index;
  "modules/auth/types": typeof modules_auth_types;
  "modules/common/trigger/index": typeof modules_common_trigger_index;
  "modules/flows/frontend": typeof modules_flows_frontend;
  "modules/flows/raw/const": typeof modules_flows_raw_const;
  "modules/flows/raw/index": typeof modules_flows_raw_index;
  "modules/flows/raw/schemas": typeof modules_flows_raw_schemas;
  "modules/flows/raw/trigger/index": typeof modules_flows_raw_trigger_index;
  "modules/flows/thought_leadership_169/const": typeof modules_flows_thought_leadership_169_const;
  "modules/flows/thought_leadership_169/helpers": typeof modules_flows_thought_leadership_169_helpers;
  "modules/flows/thought_leadership_169/index": typeof modules_flows_thought_leadership_169_index;
  "modules/flows/thought_leadership_169/prompts/generate_template": typeof modules_flows_thought_leadership_169_prompts_generate_template;
  "modules/flows/thought_leadership_169/schemas": typeof modules_flows_thought_leadership_169_schemas;
  "modules/flows/thought_leadership_169/trigger/index": typeof modules_flows_thought_leadership_169_trigger_index;
  "modules/flows/thought_leadership_916/const": typeof modules_flows_thought_leadership_916_const;
  "modules/flows/thought_leadership_916/helpers": typeof modules_flows_thought_leadership_916_helpers;
  "modules/flows/thought_leadership_916/index": typeof modules_flows_thought_leadership_916_index;
  "modules/flows/thought_leadership_916/prompts/generate_template": typeof modules_flows_thought_leadership_916_prompts_generate_template;
  "modules/flows/thought_leadership_916/schemas": typeof modules_flows_thought_leadership_916_schemas;
  "modules/flows/thought_leadership_916/trigger/index": typeof modules_flows_thought_leadership_916_trigger_index;
  "modules/flows/trigger/index": typeof modules_flows_trigger_index;
  "modules/insights/helpers": typeof modules_insights_helpers;
  "modules/insights/index": typeof modules_insights_index;
  "modules/insights/prompts/generate_content_pillars": typeof modules_insights_prompts_generate_content_pillars;
  "modules/insights/schemas": typeof modules_insights_schemas;
  "modules/insights/trigger/index": typeof modules_insights_trigger_index;
  "modules/organization/index": typeof modules_organization_index;
  "modules/organization/internal": typeof modules_organization_internal;
  "modules/organization/private": typeof modules_organization_private;
  "modules/organization/schemas": typeof modules_organization_schemas;
  "modules/rendered_video/index": typeof modules_rendered_video_index;
  "modules/rendered_video/private": typeof modules_rendered_video_private;
  "modules/rendered_video/schemas": typeof modules_rendered_video_schemas;
  "modules/rendered_video/trigger/index": typeof modules_rendered_video_trigger_index;
  "modules/resources/avatar/index": typeof modules_resources_avatar_index;
  "modules/resources/avatar/private": typeof modules_resources_avatar_private;
  "modules/resources/avatar/schemas": typeof modules_resources_avatar_schemas;
  "modules/resources/avatar/trigger/index": typeof modules_resources_avatar_trigger_index;
  "modules/resources/product_dataset/helpers": typeof modules_resources_product_dataset_helpers;
  "modules/resources/product_dataset/index": typeof modules_resources_product_dataset_index;
  "modules/resources/product_dataset/prompts/search_clips": typeof modules_resources_product_dataset_prompts_search_clips;
  "modules/resources/product_dataset/schemas": typeof modules_resources_product_dataset_schemas;
  "modules/resources/product_dataset/trigger/index": typeof modules_resources_product_dataset_trigger_index;
  "modules/upload/index": typeof modules_upload_index;
  "modules/workspace/index": typeof modules_workspace_index;
  "modules/workspace/schemas": typeof modules_workspace_schemas;
  "private/flows/raw": typeof private_flows_raw;
  "private/flows/thought_leadership_169": typeof private_flows_thought_leadership_169;
  "private/flows/thought_leadership_916": typeof private_flows_thought_leadership_916;
  "private/insights": typeof private_insights;
  "private/organization": typeof private_organization;
  "private/rendered_video": typeof private_rendered_video;
  "private/resources/avatar": typeof private_resources_avatar;
  "private/resources/product_dataset": typeof private_resources_product_dataset;
  "private/workspace": typeof private_workspace;
  "protected/admin/organization": typeof protected_admin_organization;
  "protected/admin/resources/avatar": typeof protected_admin_resources_avatar;
  "protected/admin/resources/product_dataset": typeof protected_admin_resources_product_dataset;
  "protected/auth": typeof protected_auth;
  "protected/flows/raw": typeof protected_flows_raw;
  "protected/flows/thought_leadership_169": typeof protected_flows_thought_leadership_169;
  "protected/flows/thought_leadership_916": typeof protected_flows_thought_leadership_916;
  "protected/insights": typeof protected_insights;
  "protected/rendered_video": typeof protected_rendered_video;
  "protected/resources/avatar": typeof protected_resources_avatar;
  "protected/resources/product_dataset": typeof protected_resources_product_dataset;
  "protected/workspace": typeof protected_workspace;
  "schema/common": typeof schema_common;
  "schema/content_pillar": typeof schema_content_pillar;
  "schema/flows": typeof schema_flows;
  "schema/organization": typeof schema_organization;
  "schema/rendered_video": typeof schema_rendered_video;
  "schema/resources/avatar": typeof schema_resources_avatar;
  "schema/resources/product_dataset": typeof schema_resources_product_dataset;
  "schema/user": typeof schema_user;
  "schema/workspace": typeof schema_workspace;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  crons: {
    public: {
      del: FunctionReference<
        "mutation",
        "internal",
        { identifier: { id: string } | { name: string } },
        null
      >;
      get: FunctionReference<
        "query",
        "internal",
        { identifier: { id: string } | { name: string } },
        {
          args: Record<string, any>;
          functionHandle: string;
          id: string;
          name?: string;
          schedule:
            | { kind: "interval"; ms: number }
            | { cronspec: string; kind: "cron"; tz?: string };
        } | null
      >;
      list: FunctionReference<
        "query",
        "internal",
        {},
        Array<{
          args: Record<string, any>;
          functionHandle: string;
          id: string;
          name?: string;
          schedule:
            | { kind: "interval"; ms: number }
            | { cronspec: string; kind: "cron"; tz?: string };
        }>
      >;
      register: FunctionReference<
        "mutation",
        "internal",
        {
          args: Record<string, any>;
          functionHandle: string;
          name?: string;
          schedule:
            | { kind: "interval"; ms: number }
            | { cronspec: string; kind: "cron"; tz?: string };
        },
        string
      >;
    };
  };
  workflow: {
    journal: {
      load: FunctionReference<
        "query",
        "internal",
        { workflowId: string },
        {
          inProgress: Array<{
            _creationTime: number;
            _id: string;
            step: {
              args: any;
              argsSize: number;
              completedAt?: number;
              functionType: "query" | "mutation" | "action";
              handle: string;
              inProgress: boolean;
              name: string;
              runResult?:
                | { kind: "success"; returnValue: any }
                | { error: string; kind: "failed" }
                | { kind: "canceled" };
              startedAt: number;
              workId?: string;
            };
            stepNumber: number;
            workflowId: string;
          }>;
          journalEntries: Array<{
            _creationTime: number;
            _id: string;
            step: {
              args: any;
              argsSize: number;
              completedAt?: number;
              functionType: "query" | "mutation" | "action";
              handle: string;
              inProgress: boolean;
              name: string;
              runResult?:
                | { kind: "success"; returnValue: any }
                | { error: string; kind: "failed" }
                | { kind: "canceled" };
              startedAt: number;
              workId?: string;
            };
            stepNumber: number;
            workflowId: string;
          }>;
          logLevel: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
          ok: boolean;
          workflow: {
            _creationTime: number;
            _id: string;
            args: any;
            generationNumber: number;
            logLevel?: any;
            name?: string;
            onComplete?: { context?: any; fnHandle: string };
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt?: any;
            state?: any;
            workflowHandle: string;
          };
        }
      >;
      startStep: FunctionReference<
        "mutation",
        "internal",
        {
          generationNumber: number;
          name: string;
          retry?:
            | boolean
            | { base: number; initialBackoffMs: number; maxAttempts: number };
          schedulerOptions?: { runAt?: number } | { runAfter?: number };
          step: {
            args: any;
            argsSize: number;
            completedAt?: number;
            functionType: "query" | "mutation" | "action";
            handle: string;
            inProgress: boolean;
            name: string;
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt: number;
            workId?: string;
          };
          workflowId: string;
          workpoolOptions?: {
            defaultRetryBehavior?: {
              base: number;
              initialBackoffMs: number;
              maxAttempts: number;
            };
            logLevel?: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
            maxParallelism?: number;
            retryActionsByDefault?: boolean;
          };
        },
        {
          _creationTime: number;
          _id: string;
          step: {
            args: any;
            argsSize: number;
            completedAt?: number;
            functionType: "query" | "mutation" | "action";
            handle: string;
            inProgress: boolean;
            name: string;
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt: number;
            workId?: string;
          };
          stepNumber: number;
          workflowId: string;
        }
      >;
    };
    workflow: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        { workflowId: string },
        null
      >;
      cleanup: FunctionReference<
        "mutation",
        "internal",
        { workflowId: string },
        boolean
      >;
      complete: FunctionReference<
        "mutation",
        "internal",
        {
          generationNumber: number;
          now: number;
          runResult:
            | { kind: "success"; returnValue: any }
            | { error: string; kind: "failed" }
            | { kind: "canceled" };
          workflowId: string;
        },
        null
      >;
      create: FunctionReference<
        "mutation",
        "internal",
        {
          maxParallelism?: number;
          onComplete?: { context?: any; fnHandle: string };
          validateAsync?: boolean;
          workflowArgs: any;
          workflowHandle: string;
          workflowName: string;
        },
        string
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { workflowId: string },
        {
          inProgress: Array<{
            _creationTime: number;
            _id: string;
            step: {
              args: any;
              argsSize: number;
              completedAt?: number;
              functionType: "query" | "mutation" | "action";
              handle: string;
              inProgress: boolean;
              name: string;
              runResult?:
                | { kind: "success"; returnValue: any }
                | { error: string; kind: "failed" }
                | { kind: "canceled" };
              startedAt: number;
              workId?: string;
            };
            stepNumber: number;
            workflowId: string;
          }>;
          logLevel: "DEBUG" | "TRACE" | "INFO" | "REPORT" | "WARN" | "ERROR";
          workflow: {
            _creationTime: number;
            _id: string;
            args: any;
            generationNumber: number;
            logLevel?: any;
            name?: string;
            onComplete?: { context?: any; fnHandle: string };
            runResult?:
              | { kind: "success"; returnValue: any }
              | { error: string; kind: "failed" }
              | { kind: "canceled" };
            startedAt?: any;
            state?: any;
            workflowHandle: string;
          };
        }
      >;
    };
  };
  actionCache: {
    crons: {
      purge: FunctionReference<
        "mutation",
        "internal",
        { expiresAt?: number },
        null
      >;
    };
    lib: {
      get: FunctionReference<
        "query",
        "internal",
        { args: any; name: string; ttl: number | null },
        { kind: "hit"; value: any } | { expiredEntry?: string; kind: "miss" }
      >;
      put: FunctionReference<
        "mutation",
        "internal",
        {
          args: any;
          expiredEntry?: string;
          name: string;
          ttl: number | null;
          value: any;
        },
        { cacheHit: boolean; deletedExpiredEntry: boolean }
      >;
      remove: FunctionReference<
        "mutation",
        "internal",
        { args: any; name: string },
        null
      >;
      removeAll: FunctionReference<
        "mutation",
        "internal",
        { batchSize?: number; before?: number; name?: string },
        null
      >;
    };
  };
  actionRetrier: {
    public: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        { runId: string },
        boolean
      >;
      cleanup: FunctionReference<
        "mutation",
        "internal",
        { runId: string },
        any
      >;
      start: FunctionReference<
        "mutation",
        "internal",
        {
          functionArgs: any;
          functionHandle: string;
          options: {
            base: number;
            initialBackoffMs: number;
            logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
            maxFailures: number;
            onComplete?: string;
            runAfter?: number;
            runAt?: number;
          };
        },
        string
      >;
      status: FunctionReference<
        "query",
        "internal",
        { runId: string },
        | { type: "inProgress" }
        | {
            result:
              | { returnValue: any; type: "success" }
              | { error: string; type: "failed" }
              | { type: "canceled" };
            type: "completed";
          }
      >;
    };
  };
  migrations: {
    lib: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        { name: string },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
      cancelAll: FunctionReference<
        "mutation",
        "internal",
        { sinceTs?: number },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { limit?: number; names?: Array<string> },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      migrate: FunctionReference<
        "mutation",
        "internal",
        {
          batchSize?: number;
          cursor?: string | null;
          dryRun: boolean;
          fnHandle: string;
          name: string;
          next?: Array<{ fnHandle: string; name: string }>;
        },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
    };
  };
};
