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

export const getRepos = query({
  args: {},
  handler: async (ctx) => {
    const repos = await ctx.db.query("repos").collect();
    const reposWithInstallId = await Promise.all(
      repos.map(async (repo) => {
        const installation = await ctx.db.get(repo.installationId);
        return {
          ...repo,
          githubInstallId: installation?.githubInstallId,
        };
      })
    );
    return reposWithInstallId;
  },
});

export const getRecentActivity = query({
  args: { since: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("branchActivity")
      .filter((q) => q.gt(q.field("lastPushTimestamp"), args.since))
      .collect();
  },
});

export const saveStandup = mutation({
  args: {
    author: v.string(),
    yesterday: v.array(v.string()),
    today: v.array(v.string()),
    blockers: v.array(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("standups")
      .withIndex("by_user_date", (q) =>
        q.eq("author", args.author).eq("date", args.date)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        yesterday: args.yesterday,
        today: args.today,
        blockers: args.blockers,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("standups", {
        author: args.author,
        yesterday: args.yesterday,
        today: args.today,
        blockers: args.blockers,
        date: args.date,
        createdAt: Date.now(),
      });
    }
  },
});

export const getStandups = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("standups")
      .order("desc")
      .take(50);
  },
});
