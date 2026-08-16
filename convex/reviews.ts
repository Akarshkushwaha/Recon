import { query } from "./_generated/server";
import { getUserRepoIds } from "./authHelpers";

export const getReviewInsights = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const githubUsernameLower = identity?.nickname?.toLowerCase(); 
    
    const repoIds = await getUserRepoIds(ctx);
    if (repoIds.length === 0) {
      return {
        assignedToMe: [],
        awaitingOthers: [],
        stuck: [],
        conflictBlocked: [],
      };
    }

    // Get all open PRs in these repos
    const allOpenPRs = await ctx.db
      .query("pullRequests")
      .filter((q) => q.eq(q.field("state"), "open"))
      .collect();

    const repoOpenPRs = allOpenPRs.filter((pr) => repoIds.includes(pr.repoId));

    const now = Date.now();
    const STUCK_THRESHOLD_MS = 48 * 60 * 60 * 1000; // 48 hours

    const assignedToMe = [];
    const awaitingOthers = [];
    const stuck = [];
    const conflictBlocked = [];

    for (const pr of repoOpenPRs) {
      const prAuthorLower = pr.author?.toLowerCase();
      const requestedReviewersLower = pr.requestedReviewers?.map((r: string) => r.toLowerCase()) || [];

      // 1. Conflict Blocked
      if (pr.mergeableState === "dirty") {
        conflictBlocked.push(pr);
      }

      // 2. Assigned to Me
      if (githubUsernameLower && requestedReviewersLower.includes(githubUsernameLower)) {
        assignedToMe.push(pr);
      }

      // 3. Awaiting Others (I am the author, and it's not approved yet)
      if (githubUsernameLower && prAuthorLower === githubUsernameLower) {
        const hasApproval = pr.reviews?.some((r: any) => r.state === "APPROVED");
        if (!hasApproval) {
          awaitingOthers.push(pr);
        }
      }

      // 4. Stuck PRs
      const prUpdatedAt = pr.updatedAt || now;
      const timeSinceUpdate = now - prUpdatedAt;
      if (timeSinceUpdate > STUCK_THRESHOLD_MS) {
        stuck.push(pr);
      }
    }

    // Sort by most recently updated
    const sortByUpdated = (a: any, b: any) => (b.updatedAt || b.openedAt || 0) - (a.updatedAt || a.openedAt || 0);
    
    return {
      assignedToMe: assignedToMe.sort(sortByUpdated),
      awaitingOthers: awaitingOthers.sort(sortByUpdated),
      stuck: stuck.sort(sortByUpdated),
      conflictBlocked: conflictBlocked.sort(sortByUpdated),
    };
  },
});
