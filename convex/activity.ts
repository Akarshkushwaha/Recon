import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getLatestActivity = query({
  args: {},
  handler: async (ctx) => {
    // Fetch latest branch activity across all repos
    const activity = await ctx.db
      .query("branchActivity")
      .order("desc")
      .take(20);

    return activity;
  },
});

export const getActiveConflicts = query({
  args: {},
  handler: async (ctx) => {
    // Fetch unresolved and undismissed conflicts
    return await ctx.db
      .query("conflicts")
      .withIndex("by_repo")
      .filter((q) => q.eq(q.field("dismissed"), false))
      .collect();
  },
});

export const getRepoByGithubId = query({
  args: { githubRepoId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("repos")
      .withIndex("by_repo_id", (q) => q.eq("githubRepoId", args.githubRepoId))
      .unique();
  },
});

// Cron Stubs
export const generateStandups = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Generating daily standups...");
    // Logic to aggregate work goes here
  },
});

export const detectStaleBranches = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Checking for stale branches...");
    // Logic to flag branches older than 7 days
  },
});

export const sendReviewReminders = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Checking for PRs needing review...");
    // Logic to nudge reviewers
  },
});
