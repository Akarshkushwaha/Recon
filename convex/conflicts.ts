import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

export const detectConflicts = action({
  args: {
    repoId: v.id("repos"),
    pushedBranch: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get all active branches for this repo (last 48 hours)
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
    
    // We need a query for this. Since we are in an action, we call a query.
    const activeBranches = await ctx.runQuery(api.conflicts.getActiveBranches, {
      repoId: args.repoId,
      since: fortyEightHoursAgo,
    });

    const currentBranch = activeBranches.find((b: Doc<"branchActivity">) => b.branchName === args.pushedBranch);
    if (!currentBranch) return;

    const otherBranches = activeBranches.filter((b: Doc<"branchActivity">) => b.branchName !== args.pushedBranch);

    for (const other of otherBranches) {
      const commonFiles = currentBranch.filesChanged.filter((f: string) =>
        other.filesChanged.includes(f)
      );

      if (commonFiles.length > 0) {
        // Conflict detected!
        await ctx.runMutation(api.conflicts.saveConflict, {
          repoId: args.repoId,
          branch1: currentBranch.branchName,
          branch2: other.branchName,
          author1: currentBranch.authorLogin,
          author2: other.authorLogin,
          conflictingFiles: commonFiles,
        });
      }
    }
  },
});

export const getActiveBranches = query({
  args: { repoId: v.id("repos"), since: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("branchActivity")
      .withIndex("by_repo_and_branch", (q) => q.eq("repoId", args.repoId))
      .filter((q) => q.gt(q.field("lastPushTimestamp"), args.since))
      .collect();
  },
});

export const saveConflict = mutation({
  args: {
    repoId: v.id("repos"),
    branch1: v.string(),
    branch2: v.string(),
    author1: v.string(),
    author2: v.string(),
    conflictingFiles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if this conflict already exists and isn't resolved/dismissed
    const existing = await ctx.db
      .query("conflicts")
      .withIndex("by_repo", (q) => q.eq("repoId", args.repoId))
      .filter((q) =>
        q.and(
          q.eq(q.field("branch1"), args.branch1),
          q.eq(q.field("branch2"), args.branch2),
          q.eq(q.field("dismissed"), false)
        )
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("conflicts", {
        repoId: args.repoId,
        branch1: args.branch1,
        branch2: args.branch2,
        author1: args.author1,
        author2: args.author2,
        conflictingFiles: args.conflictingFiles,
        detectedAt: Date.now(),
        dismissed: false,
      });
    }
  },
});

export const dismissConflict = mutation({
  args: { conflictId: v.id("conflicts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conflictId, {
      dismissed: true,
      resolvedAt: Date.now(),
    });
  },
});
