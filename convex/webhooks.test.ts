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
});
