import { query } from "./_generated/server";
import { getUserRepoIds } from "./authHelpers";

export const getReviewInsights = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const githubUsername = identity?.nickname; 
    
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
      // 1. Conflict Blocked
      if (pr.mergeableState === "dirty") {
        conflictBlocked.push(pr);
      }

      // 2. Assigned to Me
      if (githubUsername && pr.requestedReviewers?.includes(githubUsername)) {
        assignedToMe.push(pr);
      }

      // 3. Awaiting Others (I am the author, and it's not approved yet)
      if (githubUsername && pr.author === githubUsername) {
        const hasApproval = pr.reviews?.some((r) => r.state === "APPROVED");
        if (!hasApproval) {
          awaitingOthers.push(pr);
        }
      }

      // 4. Stuck PRs
      const timeSinceUpdate = now - pr.updatedAt;
      if (timeSinceUpdate > STUCK_THRESHOLD_MS) {
        stuck.push(pr);
      }
    }

    // Sort by most recently updated
    const sortByUpdated = (a: any, b: any) => b.updatedAt - a.updatedAt;
    
    return {
      assignedToMe: assignedToMe.sort(sortByUpdated),
      awaitingOthers: awaitingOthers.sort(sortByUpdated),
      stuck: stuck.sort(sortByUpdated),
      conflictBlocked: conflictBlocked.sort(sortByUpdated),
    };
  },
});
