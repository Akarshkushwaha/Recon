import { query, mutation, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getUserRepoIds } from "./authHelpers";

export const getUserRepos = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const allInstallations = await ctx.db.query("installations").collect();
    const installations = allInstallations.filter(
      (inst) => inst.userId === identity.subject || !inst.userId
    );

    if (installations.length === 0) return [];

    const repos: Array<{ _id: Id<"repos">; name: string; fullName: string; githubRepoId: number }> = [];
    for (const inst of installations) {
      const instRepos = await ctx.db
        .query("repos")
        .filter((q) => q.eq(q.field("installationId"), inst._id))
        .collect();
      for (const r of instRepos) {
        repos.push({ _id: r._id, name: r.name, fullName: r.fullName, githubRepoId: r.githubRepoId });
      }
    }
    return repos;
  },
});

export const getLatestActivity = query({
  args: { repoId: v.optional(v.id("repos")) },
  handler: async (ctx, args) => {
    let repoIds = await getUserRepoIds(ctx);
    if (repoIds.length === 0) return [];
    if (args.repoId) {
      if (!repoIds.includes(args.repoId)) return [];
      repoIds = [args.repoId];
    }

    // Fetch latest branch activity across user's repos
    const activity = await ctx.db
      .query("branchActivity")
      .order("desc")
      .collect();

    return activity
      .filter((a) => repoIds.includes(a.repoId))
      .slice(0, 20);
  },
});

export const getActiveConflicts = query({
  args: { repoId: v.optional(v.id("repos")) },
  handler: async (ctx, args) => {
    let repoIds = await getUserRepoIds(ctx);
    if (repoIds.length === 0) return [];
    if (args.repoId) {
      if (!repoIds.includes(args.repoId)) return [];
      repoIds = [args.repoId];
    }

    // Fetch unresolved and undismissed conflicts
    const conflicts = await ctx.db
      .query("conflicts")
      .withIndex("by_repo")
      .filter((q) => q.eq(q.field("dismissed"), false))
      .collect();

    return conflicts.filter((c) => repoIds.includes(c.repoId));
  },
});


export const getRepoByGithubId = query({
  args: { githubRepoId: v.number() },
  handler: async (ctx, args) => {
    const repoIds = await getUserRepoIds(ctx);
    const repo = await ctx.db
      .query("repos")
      .withIndex("by_repo_id", (q) => q.eq("githubRepoId", args.githubRepoId))
      .unique();
    if (!repo || !repoIds.includes(repo._id)) return null;
    return repo;
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
    const repoIds = await getUserRepoIds(ctx);
    if (repoIds.length === 0) return [];

    const repos = await ctx.db.query("repos").collect();
    const userRepos = repos.filter((r) => repoIds.includes(r._id));

    const reposWithInstallId = await Promise.all(
      userRepos.map(async (repo) => {
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
    const repoIds = await getUserRepoIds(ctx);
    if (repoIds.length === 0) return [];

    const activity = await ctx.db
      .query("branchActivity")
      .filter((q) => q.gt(q.field("lastPushTimestamp"), args.since))
      .collect();
      
    return activity.filter((a) => repoIds.includes(a.repoId));
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
    // Note: If you want to filter standups by team members in the user's repos, 
    // you would need more complex logic. For now, we can leave standups global 
    // or return none if not authenticated.
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("standups")
      .order("desc")
      .take(50);
  },
});

