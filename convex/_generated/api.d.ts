/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activity from "../activity.js";
import type * as ai from "../ai.js";
import type * as analytics from "../analytics.js";
import type * as authHelpers from "../authHelpers.js";
import type * as changelogs from "../changelogs.js";
import type * as clear from "../clear.js";
import type * as conflicts from "../conflicts.js";
import type * as crons from "../crons.js";
import type * as gemini from "../gemini.js";
import type * as github from "../github.js";
import type * as githubSync from "../githubSync.js";
import type * as notifications from "../notifications.js";
import type * as settings from "../settings.js";
import type * as team from "../team.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activity: typeof activity;
  ai: typeof ai;
  analytics: typeof analytics;
  authHelpers: typeof authHelpers;
  changelogs: typeof changelogs;
  clear: typeof clear;
  conflicts: typeof conflicts;
  crons: typeof crons;
  gemini: typeof gemini;
  github: typeof github;
  githubSync: typeof githubSync;
  notifications: typeof notifications;
  settings: typeof settings;
  team: typeof team;
  webhooks: typeof webhooks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
