import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  installations: defineTable({
    githubInstallId: v.number(),
    accountLogin: v.string(),
    accountType: v.string(), // "User" or "Organization"
    avatarUrl: v.string(),
  }).index("by_install_id", ["githubInstallId"]),

  repos: defineTable({
    installationId: v.id("installations"),
    githubRepoId: v.number(),
    name: v.string(),
    fullName: v.string(),
  }).index("by_repo_id", ["githubRepoId"]),

  branchActivity: defineTable({
    repoId: v.id("repos"),
    branchName: v.string(),
    authorLogin: v.string(),
    authorAvatar: v.string(),
    filesChanged: v.array(v.string()),
    commitCount: v.number(),
    lastPushTimestamp: v.number(),
  }).index("by_repo_and_branch", ["repoId", "branchName"]),

  conflicts: defineTable({
    repoId: v.id("repos"),
    branch1: v.string(),
    branch2: v.string(),
    author1: v.string(),
    author2: v.string(),
    conflictingFiles: v.array(v.string()),
    detectedAt: v.number(),
    resolvedAt: v.optional(v.number()),
    dismissed: v.boolean(),
  }).index("by_repo", ["repoId"]),

  pullRequests: defineTable({
    repoId: v.id("repos"),
    prNumber: v.number(),
    title: v.string(),
    author: v.string(),
    state: v.string(), // "open", "closed", "merged"
    descriptionGenerated: v.boolean(),
    nudge24hSent: v.boolean(),
    nudge48hSent: v.boolean(),
    openedAt: v.number(),
    updatedAt: v.number(),
    closedAt: v.optional(v.number()),
  }).index("by_repo_and_pr", ["repoId", "prNumber"]),

  staleAlerts: defineTable({
    repoId: v.id("repos"),
    branchName: v.string(),
    author: v.string(),
    lastPushTime: v.number(),
    dismissed: v.boolean(),
  }),

  nlIssues: defineTable({
    userId: v.string(), // From NextAuth
    inputText: v.string(),
    parsedTitle: v.string(),
    parsedBody: v.string(),
    parsedLabel: v.optional(v.string()),
    parsedAssignee: v.optional(v.string()),
    githubIssueId: v.optional(v.number()),
    createdAt: v.number(),
  }),

  standups: defineTable({
    author: v.string(),
    yesterday: v.array(v.string()),
    today: v.array(v.string()),
    blockers: v.array(v.string()),
    date: v.string(),
    createdAt: v.number(),
  }).index("by_user_date", ["author", "date"]),
});
