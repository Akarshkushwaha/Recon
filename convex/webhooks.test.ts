import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

describe("Webhook Processing", () => {
  test("handlePush processes branch activity properly", async () => {
    const t = convexTest(schema);

    // 1. Setup mock repo
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
        name: "webhook-repo",
        fullName: "test-org/webhook-repo",
      });
    });

    // 2. Process a simulated push
    await t.mutation(api.webhooks.handlePush, {
      repoId: 555,
      branchName: "main",
      authorLogin: "devuser",
      authorAvatar: "http://example.com/avatar.png",
      filesChanged: ["src/index.ts", "README.md"],
      commitCount: 2,
      commits: [
        { id: "sha1", message: "Initial commit", url: "http://example.com/sha1", timestamp: "2024-01-01T12:00:00Z" },
        { id: "sha2", message: "Update readme", url: "http://example.com/sha2", timestamp: "2024-01-01T12:05:00Z" }
      ],
    });

    // 3. Verify Branch Activity
    const branches = await t.run(async (ctx) => {
      return await ctx.db.query("branchActivity").collect();
    });

    expect(branches.length).toBe(1);
    expect(branches[0].branchName).toBe("main");
    expect(branches[0].commitCount).toBe(2);
    expect(branches[0].filesChanged).toEqual(["src/index.ts", "README.md"]);
    
    // 4. Verify Commits were inserted
    const commits = await t.run(async (ctx) => {
      return await ctx.db.query("commits").collect();
    });
    
    expect(commits.length).toBe(2);
    expect(commits[0].sha).toBe("sha1");
    expect(commits[1].sha).toBe("sha2");
  });

  test("handlePROpened and handlePRReview process PR states properly", async () => {
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
        githubRepoId: 999,
        name: "pr-repo",
        fullName: "test-org/pr-repo",
      });
    });

    // 1. Simulate PR opened
    await t.mutation(api.webhooks.handlePROpened, {
      repoId,
      prNumber: 42,
      title: "Add awesome feature",
      author: "devuser",
      requestedReviewers: ["reviewer1"],
      mergeableState: "dirty",
      url: "http://example.com/pr/42"
    });

    let prs = await t.run(async (ctx) => ctx.db.query("pullRequests").collect());
    expect(prs.length).toBe(1);
    expect(prs[0].title).toBe("Add awesome feature");
    expect(prs[0].requestedReviewers).toContain("reviewer1");
    expect(prs[0].mergeableState).toBe("dirty");

    // 2. Simulate PR review
    await t.mutation(api.webhooks.handlePRReview, {
      repoId,
      prNumber: 42,
      reviewer: "reviewer1",
      state: "APPROVED"
    });

    prs = await t.run(async (ctx) => ctx.db.query("pullRequests").collect());
    expect(prs[0].reviews?.length).toBe(1);
    expect(prs[0].reviews?.[0].reviewer).toBe("reviewer1");
    expect(prs[0].reviews?.[0].state).toBe("APPROVED");

    // 3. Update PR (e.g. synchronized)
    await t.mutation(api.webhooks.handlePRUpdate, {
      repoId,
      prNumber: 42,
      mergeableState: "clean"
    });

    prs = await t.run(async (ctx) => ctx.db.query("pullRequests").collect());
    expect(prs[0].mergeableState).toBe("clean");
  });
});
