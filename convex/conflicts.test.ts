import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

describe("Conflict Detection", () => {
  test("saveConflict handles conflicts correctly", async () => {
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
        githubRepoId: 999,
        name: "test-repo",
        fullName: "test-org/test-repo",
      });
    });

    // 2. Invoke saveConflict mutation
    await t.mutation(api.conflicts.saveConflict, {
      repoId,
      branch1: "feature-a",
      branch2: "feature-b",
      author1: "alice",
      author2: "bob",
      conflictingFiles: ["src/index.ts", "package.json"],
    });

    // 3. Verify it was saved
    const conflicts = await t.run(async (ctx) => {
      return await ctx.db.query("conflicts").collect();
    });

    expect(conflicts.length).toBe(1);
    expect(conflicts[0].branch1).toBe("feature-a");
    expect(conflicts[0].conflictingFiles).toContain("src/index.ts");
    expect(conflicts[0].dismissed).toBe(false);

    // 4. Test deduplication
    await t.mutation(api.conflicts.saveConflict, {
        repoId,
        branch1: "feature-a",
        branch2: "feature-b",
        author1: "alice",
        author2: "bob",
        conflictingFiles: ["src/index.ts", "package.json"],
    });

    const conflictsAfterDupe = await t.run(async (ctx) => {
        return await ctx.db.query("conflicts").collect();
    });
    
    // Should still be exactly 1 because the second one was ignored as a duplicate
    expect(conflictsAfterDupe.length).toBe(1);
  });
});
