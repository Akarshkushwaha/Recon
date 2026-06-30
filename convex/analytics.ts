import { query } from "./_generated/server";
import { v } from "convex/values";
import { getUserRepoIds } from "./authHelpers";

// ────────────────────────────────────────────────────
// 1. Contributor Heatmap
//    Groups pushes by author × dayOfWeek × hour (filtered by repoId optionally)
// ────────────────────────────────────────────────────
export const getContributorHeatmap = query({
  args: {
    repoId: v.optional(v.id("repos")),
  },
  handler: async (ctx, args) => {
    const repoIds = await getUserRepoIds(ctx);
    if (repoIds.length === 0) return { grid: Array.from({ length: 7 }, () => Array(24).fill(0)), authorMap: {}, totalPushes: 0 };
    
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let activity;

    if (args.repoId) {
      activity = await ctx.db
        .query("branchActivity")
        .filter((q) =>
          q.and(
            q.gt(q.field("lastPushTimestamp"), thirtyDaysAgo),
            q.eq(q.field("repoId"), args.repoId!)
          )
        )
        .collect();
    } else {
      activity = await ctx.db
        .query("branchActivity")
        .filter((q) => q.gt(q.field("lastPushTimestamp"), thirtyDaysAgo))
        .collect();
      activity = activity.filter((a) => repoIds.includes(a.repoId));
    }

    // Build a 7×24 grid: cells[day][hour] = count
    const grid: number[][] = Array.from({ length: 7 }, () =>
      Array(24).fill(0)
    );

    // Track per-author contributions
    const authorMap: Record<string, number> = {};

    for (const item of activity) {
      const d = new Date(item.lastPushTimestamp);
      const day = d.getUTCDay(); // 0=Sun … 6=Sat
      const hour = d.getUTCHours();
      grid[day][hour] += item.commitCount;
      authorMap[item.authorLogin] =
        (authorMap[item.authorLogin] || 0) + item.commitCount;
    }

    return { grid, authorMap, totalPushes: activity.length };
  },
});

// ────────────────────────────────────────────────────
// 2. PR Review Velocity
//    Avg time from open → merge for closed PRs (filtered by repoId optionally)
// ────────────────────────────────────────────────────
export const getReviewVelocity = query({
  args: {
    repoId: v.optional(v.id("repos")),
  },
  handler: async (ctx, args) => {
    const repoIds = await getUserRepoIds(ctx);
    if (repoIds.length === 0) return { totalPRs: 0, mergedCount: 0, openCount: 0, closedCount: 0, avgMergeHours: 0, authorVelocity: {} };

    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    let prs;

    if (args.repoId) {
      prs = await ctx.db
        .query("pullRequests")
        .withIndex("by_repo_and_pr", (q) => q.eq("repoId", args.repoId!))
        .filter((q) => q.gt(q.field("openedAt"), ninetyDaysAgo))
        .collect();
    } else {
      prs = await ctx.db
        .query("pullRequests")
        .filter((q) => q.gt(q.field("openedAt"), ninetyDaysAgo))
        .collect();
      prs = prs.filter((pr) => repoIds.includes(pr.repoId));
    }

    const merged = prs.filter((pr) => pr.state === "merged" && pr.closedAt);
    const open = prs.filter((pr) => pr.state === "open");
    const closed = prs.filter((pr) => pr.state === "closed" && !pr.closedAt);

    // Per-author velocity
    const authorVelocity: Record<
      string,
      { totalMs: number; count: number; avgHours: number }
    > = {};
    let totalMergeMs = 0;

    for (const pr of merged) {
      const durationMs = pr.closedAt! - pr.openedAt;
      totalMergeMs += durationMs;
      if (!authorVelocity[pr.author]) {
        authorVelocity[pr.author] = { totalMs: 0, count: 0, avgHours: 0 };
      }
      authorVelocity[pr.author].totalMs += durationMs;
      authorVelocity[pr.author].count += 1;
    }

    // Calculate averages
    for (const author of Object.keys(authorVelocity)) {
      const v = authorVelocity[author];
      v.avgHours = Math.round(v.totalMs / v.count / (1000 * 60 * 60) * 10) / 10;
    }

    const avgMergeHours =
      merged.length > 0
        ? Math.round(
            (totalMergeMs / merged.length / (1000 * 60 * 60)) * 10
          ) / 10
        : 0;

    return {
      totalPRs: prs.length,
      mergedCount: merged.length,
      openCount: open.length,
      closedCount: closed.length,
      avgMergeHours,
      authorVelocity,
    };
  },
});

// ────────────────────────────────────────────────────
// 3. Weekly Leaderboard
//    Rank contributors (filtered by repoId optionally)
// ────────────────────────────────────────────────────
export const getLeaderboard = query({
  args: {
    repoId: v.optional(v.id("repos")),
  },
  handler: async (ctx, args) => {
    const repoIds = await getUserRepoIds(ctx);
    if (repoIds.length === 0) return { weekly: [], monthly: [] };

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let weeklyActivity;
    let monthlyActivity;

    if (args.repoId) {
      weeklyActivity = await ctx.db
        .query("branchActivity")
        .filter((q) =>
          q.and(
            q.gt(q.field("lastPushTimestamp"), sevenDaysAgo),
            q.eq(q.field("repoId"), args.repoId!)
          )
        )
        .collect();

      monthlyActivity = await ctx.db
        .query("branchActivity")
        .filter((q) =>
          q.and(
            q.gt(q.field("lastPushTimestamp"), thirtyDaysAgo),
            q.eq(q.field("repoId"), args.repoId!)
          )
        )
        .collect();
    } else {
      weeklyActivity = await ctx.db
        .query("branchActivity")
        .filter((q) => q.gt(q.field("lastPushTimestamp"), sevenDaysAgo))
        .collect();
      weeklyActivity = weeklyActivity.filter((a) => repoIds.includes(a.repoId));

      monthlyActivity = await ctx.db
        .query("branchActivity")
        .filter((q) => q.gt(q.field("lastPushTimestamp"), thirtyDaysAgo))
        .collect();
      monthlyActivity = monthlyActivity.filter((a) => repoIds.includes(a.repoId));
    }

    // Build weekly stats per author
    const weeklyMap: Record<
      string,
      {
        commits: number;
        filesChanged: number;
        branches: Set<string>;
        avatar: string;
      }
    > = {};

    for (const item of weeklyActivity) {
      if (!weeklyMap[item.authorLogin]) {
        weeklyMap[item.authorLogin] = {
          commits: 0,
          filesChanged: 0,
          branches: new Set(),
          avatar: item.authorAvatar,
        };
      }
      weeklyMap[item.authorLogin].commits += item.commitCount;
      weeklyMap[item.authorLogin].filesChanged += item.filesChanged.length;
      weeklyMap[item.authorLogin].branches.add(item.branchName);
    }

    // Build monthly stats per author
    const monthlyMap: Record<string, { commits: number }> = {};
    for (const item of monthlyActivity) {
      if (!monthlyMap[item.authorLogin]) {
        monthlyMap[item.authorLogin] = { commits: 0 };
      }
      monthlyMap[item.authorLogin].commits += item.commitCount;
    }

    // Convert to sorted array
    const weekly = Object.entries(weeklyMap)
      .map(([author, stats]) => ({
        author,
        avatar: stats.avatar,
        commits: stats.commits,
        filesChanged: stats.filesChanged,
        branches: stats.branches.size,
      }))
      .sort((a, b) => b.commits - a.commits);

    const monthly = Object.entries(monthlyMap)
      .map(([author, stats]) => ({
        author,
        commits: stats.commits,
      }))
      .sort((a, b) => b.commits - a.commits);

    return { weekly, monthly };
  },
});

// ────────────────────────────────────────────────────
// 4. Code Ownership Map
//    File tree path ownership (filtered by repoId optionally)
// ────────────────────────────────────────────────────
export const getCodeOwnershipMap = query({
  args: {
    repoId: v.optional(v.id("repos")),
  },
  handler: async (ctx, args) => {
    let activity;

    if (args.repoId) {
      activity = await ctx.db
        .query("branchActivity")
        .filter((q) => q.eq(q.field("repoId"), args.repoId!))
        .collect();
    } else {
      activity = await ctx.db.query("branchActivity").collect();
    }

    // Build ownership by most-frequent author per path
    const pathAuthorMap: Record<string, Record<string, number>> = {};

    for (const item of activity) {
      for (const file of item.filesChanged) {
        const parts = file.split("/");
        const topLevel = parts.length > 1 ? parts[0] : "(root)";
        const secondLevel =
          parts.length > 2 ? `${parts[0]}/${parts[1]}` : topLevel;

        if (!pathAuthorMap[secondLevel]) {
          pathAuthorMap[secondLevel] = {};
        }
        pathAuthorMap[secondLevel][item.authorLogin] =
          (pathAuthorMap[secondLevel][item.authorLogin] || 0) + 1;
      }
    }

    // Convert to ownership entries
    const ownership = Object.entries(pathAuthorMap).map(
      ([path, authorCounts]) => {
        const sorted = Object.entries(authorCounts).sort(
          ([, a], [, b]) => b - a
        );
        const totalChanges = sorted.reduce((s, [, c]) => s + c, 0);
        return {
          path,
          primaryOwner: sorted[0]?.[0] || "unknown",
          primaryOwnerChanges: sorted[0]?.[1] || 0,
          totalChanges,
          percentage: totalChanges > 0
            ? Math.round((sorted[0]?.[1] || 0) / totalChanges * 100)
            : 0,
          contributors: sorted.map(([author, count]) => ({
            author,
            count,
            percentage: Math.round((count / totalChanges) * 100),
          })),
        };
      }
    );

    // Fetch defined ownership rules
    let rules;
    if (args.repoId) {
      rules = await ctx.db
        .query("featureOwnership")
        .withIndex("by_repo", (q) => q.eq("repoId", args.repoId!))
        .collect();
    } else {
      rules = await ctx.db.query("featureOwnership").collect();
    }

    return { ownership, rules };
  },
});
