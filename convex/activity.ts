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
    // 1. Get settings
    const settings = await ctx.db.query("settings").first();
    const staleThresholdMs = (settings?.staleThresholdDays || 7) * 24 * 60 * 60 * 1000;
    const staleCutoff = Date.now() - staleThresholdMs;

    // 2. Query branches
    const branches = await ctx.db.query("branchActivity").collect();
    
    for (const branch of branches) {
      if (branch.lastPushTimestamp < staleCutoff) {
        // Check if alert already exists
        const existing = await ctx.db
          .query("staleAlerts")
          .filter((q) => 
            q.and(
              q.eq(q.field("repoId"), branch.repoId),
              q.eq(q.field("branchName"), branch.branchName)
            )
          )
          .first();

        if (!existing) {
          await ctx.db.insert("staleAlerts", {
            repoId: branch.repoId,
            branchName: branch.branchName,
            author: branch.authorLogin,
            lastPushTime: branch.lastPushTimestamp,
            dismissed: false,
          });
        }
      }
    }
  },
});

export const sendReviewReminders = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Checking for PRs needing review...");
    const openPRs = await ctx.db
      .query("pullRequests")
      .filter((q) => q.eq(q.field("state"), "open"))
      .collect();

    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    const fortyEightHours = 48 * 60 * 60 * 1000;

    for (const pr of openPRs) {
      if (now - pr.openedAt > fortyEightHours && !pr.nudge48hSent) {
        console.log(`[ALERT] PR #${pr.prNumber} in repo ${pr.repoId} has been open for 48h!`);
        await ctx.db.patch(pr._id, { nudge48hSent: true });
      } else if (now - pr.openedAt > twentyFourHours && !pr.nudge24hSent) {
        console.log(`[ALERT] PR #${pr.prNumber} in repo ${pr.repoId} has been open for 24h!`);
        await ctx.db.patch(pr._id, { nudge24hSent: true });
      }
    }
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

