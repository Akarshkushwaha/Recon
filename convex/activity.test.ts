import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

describe("Activity API Processing", () => {
  test("dismisses activity, conflicts, and stale alerts properly", async () => {
    const t = convexTest(schema);

    // Setup mock repo
    const repoId = await t.run(async (ctx) => {
      const installId = await ctx.db.insert("installations", {
        githubInstallId: 1234,
        accountLogin: "test-org",
        accountType: "Organization",
        avatarUrl: "",
      });

      return await ctx.db.insert("repos", {
        installationId: installId,
        githubRepoId: 555,
        name: "test-repo",
        fullName: "test-org/test-repo",
      });
    });

    // 1. Create a branch activity
    const activityId = await t.run(async (ctx) => {
      return await ctx.db.insert("branchActivity", {
        repoId,
        branchName: "main",
        authorLogin: "devuser",
        authorAvatar: "",
        filesChanged: [],
        commitCount: 1,
        lastPushTimestamp: Date.now(),
      });
    });

    // Dismiss activity
    await t.mutation(api.activity.dismissActivity, { activityId });
    const activity = await t.run(async (ctx) => ctx.db.get(activityId));
    expect(activity?.dismissed).toBe(true);

    // 2. Create a conflict
    const conflictId = await t.run(async (ctx) => {
      return await ctx.db.insert("conflicts", {
        repoId,
        branch1: "feature-a",
        branch2: "feature-b",
        author1: "dev1",
        author2: "dev2",
        conflictingFiles: ["README.md"],
        dismissed: false,
        detectedAt: Date.now(),
      });
    });

    // Dismiss conflict
    await t.mutation(api.activity.dismissConflict, { conflictId });
    const conflict = await t.run(async (ctx) => ctx.db.get(conflictId));
    expect(conflict?.dismissed).toBe(true);

    // 3. Create a stale alert
    const staleId = await t.run(async (ctx) => {
      return await ctx.db.insert("staleAlerts", {
        repoId,
        branchName: "old-branch",
        author: "devuser",
        lastPushTime: Date.now() - 10000000,
        dismissed: false,
      });
    });

    // Dismiss stale alert
    await t.mutation(api.activity.dismissStaleAlert, { alertId: staleId });
    const stale = await t.run(async (ctx) => ctx.db.get(staleId));
    expect(stale?.dismissed).toBe(true);
  });
});
