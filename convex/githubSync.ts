import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { App } from "@octokit/app";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const saveSyncedRepoData = mutation({
  args: {
    repoId: v.id("repos"),
    branches: v.array(v.object({
      name: v.string(),
      sha: v.string(),
      authorLogin: v.string(),
      authorAvatar: v.string(),
      timestamp: v.number(),
    })),
    commits: v.array(v.object({
      sha: v.string(),
      message: v.string(),
      authorLogin: v.string(),
      authorAvatar: v.string(),
      url: v.string(),
      timestamp: v.number(),
    })),
    issues: v.array(v.object({
      issueNumber: v.number(),
      title: v.string(),
      state: v.string(),
      assignee: v.optional(v.string()),
      url: v.string(),
      updatedAt: v.number(),
    })),
    pulls: v.array(v.object({
      prNumber: v.number(),
      title: v.string(),
      author: v.string(),
      state: v.string(),
      openedAt: v.number(),
      updatedAt: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // 1. Upsert branches
    for (const b of args.branches) {
      const existingBranch = await ctx.db
        .query("branchActivity")
        .withIndex("by_repo_and_branch", (q) => q.eq("repoId", args.repoId).eq("branchName", b.name))
        .unique();

      if (existingBranch) {
        await ctx.db.patch(existingBranch._id, {
          authorLogin: b.authorLogin,
          authorAvatar: b.authorAvatar,
          lastPushTimestamp: b.timestamp,
        });
      } else {
        await ctx.db.insert("branchActivity", {
          repoId: args.repoId,
          branchName: b.name,
          authorLogin: b.authorLogin,
          authorAvatar: b.authorAvatar,
          filesChanged: [],
          commitCount: 1,
          lastPushTimestamp: b.timestamp,
        });
      }
    }

    // 2. Upsert commits
    for (const c of args.commits) {
      const existingCommit = await ctx.db
        .query("commits")
        .withIndex("by_repo", (q) => q.eq("repoId", args.repoId))
        .filter((q) => q.eq(q.field("sha"), c.sha))
        .first();

      if (!existingCommit) {
        await ctx.db.insert("commits", {
          repoId: args.repoId,
          sha: c.sha,
          message: c.message,
          authorLogin: c.authorLogin,
          authorAvatar: c.authorAvatar,
          branchName: "main", // Default fallback if branch unknown
          url: c.url,
          timestamp: c.timestamp,
        });
      }
    }

    // 3. Upsert issues
    for (const i of args.issues) {
      const existingIssue = await ctx.db
        .query("issues")
        .withIndex("by_repo_and_issue", (q) => q.eq("repoId", args.repoId).eq("issueNumber", i.issueNumber))
        .unique();

      if (existingIssue) {
        await ctx.db.patch(existingIssue._id, {
          title: i.title,
          state: i.state,
          assignee: i.assignee,
          updatedAt: i.updatedAt,
        });
      } else {
        await ctx.db.insert("issues", {
          repoId: args.repoId,
          issueNumber: i.issueNumber,
          title: i.title,
          state: i.state,
          assignee: i.assignee,
          url: i.url,
          updatedAt: i.updatedAt,
        });
      }
    }

    // 4. Upsert pull requests
    for (const p of args.pulls) {
      const existingPR = await ctx.db
        .query("pullRequests")
        .withIndex("by_repo_and_pr", (q) => q.eq("repoId", args.repoId).eq("prNumber", p.prNumber))
        .unique();

      if (existingPR) {
        await ctx.db.patch(existingPR._id, {
          title: p.title,
          state: p.state,
          updatedAt: p.updatedAt,
        });
      } else {
        await ctx.db.insert("pullRequests", {
          repoId: args.repoId,
          prNumber: p.prNumber,
          title: p.title,
          author: p.author,
          state: p.state,
          descriptionGenerated: false,
          nudge24hSent: false,
          nudge48hSent: false,
          openedAt: p.openedAt,
          updatedAt: p.updatedAt,
        });
      }
    }
  },
});

export const getReposForSync = query({
  args: {},
  handler: async (ctx) => {
    const repos = await ctx.db.query("repos").collect();
    const result: Array<{ _id: Id<"repos">; fullName: string; installId: number }> = [];
    for (const r of repos) {
      const inst = await ctx.db.get(r.installationId);
      if (inst) {
        result.push({
          _id: r._id,
          fullName: r.fullName,
          installId: inst.githubInstallId,
        });
      }
    }
    return result;
  },
});

export const syncRepoData = action({
  args: {
    installId: v.number(),
    repoId: v.id("repos"),
    repoFullName: v.string(),
  },
  handler: async (ctx, args) => {
    if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_APP_PRIVATE_KEY) {
      console.warn("GitHub App credentials missing, skipping active sync.");
      return;
    }

    try {
      const app = new App({
        appId: process.env.GITHUB_APP_ID,
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
      });
      const octokit = await app.getInstallationOctokit(args.installId);
      const [owner, repo] = args.repoFullName.split("/");

      // 1. Fetch recent commits
      const { data: commitList } = await octokit.request("GET /repos/{owner}/{repo}/commits", {
        owner,
        repo,
        per_page: 30,
      });

      const commits = commitList.map((c: any) => ({
        sha: c.sha,
        message: c.commit.message || "",
        authorLogin: c.author?.login || c.commit.author?.name || "unknown",
        authorAvatar: c.author?.avatar_url || "https://github.com/identicons/default.png",
        url: c.html_url || "",
        timestamp: new Date(c.commit.author?.date || Date.now()).getTime(),
      }));

      // 2. Fetch active branches (top 15)
      const { data: branchList } = await octokit.request("GET /repos/{owner}/{repo}/branches", {
        owner,
        repo,
        per_page: 15,
      });

      const branches: Array<{ name: string; sha: string; authorLogin: string; authorAvatar: string; timestamp: number }> = [];
      for (const b of branchList) {
        // Try to match sha in recent commits first to avoid extra API calls
        const matchedCommit = commits.find((c) => c.sha === b.commit.sha);
        if (matchedCommit) {
          branches.push({
            name: b.name,
            sha: b.commit.sha,
            authorLogin: matchedCommit.authorLogin,
            authorAvatar: matchedCommit.authorAvatar,
            timestamp: matchedCommit.timestamp,
          });
        } else {
          try {
            const { data: singleCommit } = await octokit.request("GET /repos/{owner}/{repo}/commits/{commit_sha}", {
              owner,
              repo,
              commit_sha: b.commit.sha,
            });
            branches.push({
              name: b.name,
              sha: b.commit.sha,
              authorLogin: singleCommit.author?.login || singleCommit.commit.author?.name || "unknown",
              authorAvatar: singleCommit.author?.avatar_url || "https://github.com/identicons/default.png",
              timestamp: new Date(singleCommit.commit.author?.date || Date.now()).getTime(),
            });
          } catch (e) {
            console.warn(`Could not fetch commit for branch ${b.name}`);
          }
        }
      }

      // 3. Fetch issues and PRs
      const { data: issueList } = await octokit.request("GET /repos/{owner}/{repo}/issues", {
        owner,
        repo,
        state: "open",
        per_page: 40,
      });

      const issues: Array<{ issueNumber: number; title: string; state: string; assignee?: string; url: string; updatedAt: number }> = [];
      const pulls: Array<{ prNumber: number; title: string; author: string; state: string; openedAt: number; updatedAt: number }> = [];

      for (const item of issueList) {
        if (item.pull_request) {
          pulls.push({
            prNumber: item.number,
            title: item.title,
            author: item.user?.login || "unknown",
            state: item.state,
            openedAt: new Date(item.created_at).getTime(),
            updatedAt: new Date(item.updated_at).getTime(),
          });
        } else {
          issues.push({
            issueNumber: item.number,
            title: item.title,
            state: item.state,
            assignee: item.assignee?.login,
            url: item.html_url,
            updatedAt: new Date(item.updated_at).getTime(),
          });
        }
      }

      await ctx.runMutation(api.githubSync.saveSyncedRepoData, {
        repoId: args.repoId,
        branches,
        commits,
        issues,
        pulls,
      });
      console.log(`Successfully synced active data for ${args.repoFullName}`);
    } catch (err) {
      console.error(`Failed active sync for ${args.repoFullName}:`, err);
    }
  },
});

export const syncAllRepos = action({
  args: {},
  handler: async (ctx) => {
    const repos = await ctx.runQuery(api.githubSync.getReposForSync, {});
    console.log(`Starting background Octokit sync for ${repos.length} repositories...`);
    for (const r of repos) {
      await ctx.runAction(api.githubSync.syncRepoData, {
        installId: r.installId,
        repoId: r._id,
        repoFullName: r.fullName,
      });
    }
  },
});
