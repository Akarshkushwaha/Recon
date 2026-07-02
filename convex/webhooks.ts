import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const handlePush = mutation({
  args: {
    repoId: v.number(),
    branchName: v.string(),
    authorLogin: v.string(),
    authorAvatar: v.string(),
    filesChanged: v.array(v.string()),
    commitCount: v.number(),
    commits: v.array(v.object({
      id: v.string(),
      message: v.string(),
      url: v.string(),
      timestamp: v.string()
    })),
  },
  handler: async (ctx, args) => {
    // 1. Find or Create Repo
    const repo = await ctx.db
      .query("repos")
      .withIndex("by_repo_id", (q) => q.eq("githubRepoId", args.repoId))
      .unique();

    if (!repo) return;

    // 2. Update Branch Activity
    const existingBranch = await ctx.db
      .query("branchActivity")
      .withIndex("by_repo_and_branch", (q) =>
        q.eq("repoId", repo._id).eq("branchName", args.branchName)
      )
      .unique();

    if (existingBranch) {
      await ctx.db.patch(existingBranch._id, {
        authorLogin: args.authorLogin,
        authorAvatar: args.authorAvatar,
        filesChanged: args.filesChanged,
        commitCount: args.commitCount,
        lastPushTimestamp: Date.now(),
      });
    } else {
      await ctx.db.insert("branchActivity", {
        repoId: repo._id,
        branchName: args.branchName,
        authorLogin: args.authorLogin,
        authorAvatar: args.authorAvatar,
        filesChanged: args.filesChanged,
        commitCount: args.commitCount,
        lastPushTimestamp: Date.now(),
      });
    }

    // 2.5 Insert individual commits
    for (const commit of args.commits) {
      await ctx.db.insert("commits", {
        repoId: repo._id,
        sha: commit.id,
        message: commit.message,
        authorLogin: args.authorLogin,
        authorAvatar: args.authorAvatar,
        branchName: args.branchName,
        url: commit.url,
        timestamp: new Date(commit.timestamp).getTime(),
      });
    }

    // 3. Feature Ownership Checking
    const ownershipRules = await ctx.db
      .query("featureOwnership")
      .withIndex("by_repo", (q) => q.eq("repoId", repo._id))
      .collect();

    for (const rule of ownershipRules) {
      if (rule.ownerUser !== args.authorLogin) {
        // Simple string matching for now (could use proper glob lib later)
        const matched = args.filesChanged.some(file => file.includes(rule.pathGlob));
        if (matched) {
          console.log(`[ALERT] ${args.authorLogin} touched file matching ${rule.pathGlob} owned by ${rule.ownerUser}!`);
          // NOTE: Can expand to insert into a 'violations' table later if desired.
        }
      }
    }

    return repo._id;
  },
});

export const handleInstallation = mutation({
  args: {
    installId: v.number(),
    accountLogin: v.string(),
    accountType: v.string(),
    avatarUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("installations")
      .withIndex("by_install_id", (q) => q.eq("githubInstallId", args.installId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accountLogin: args.accountLogin,
        avatarUrl: args.avatarUrl,
      });
    } else {
      await ctx.db.insert("installations", {
        githubInstallId: args.installId,
        accountLogin: args.accountLogin,
        accountType: args.accountType,
        avatarUrl: args.avatarUrl,
      });
    }
  },
});

export const handleRepoAdded = mutation({
    args: {
        installId: v.number(),
        repoId: v.number(),
        name: v.string(),
        fullName: v.string(),
    },
    handler: async (ctx, args) => {
        const installation = await ctx.db
            .query("installations")
            .withIndex("by_install_id", (q) => q.eq("githubInstallId", args.installId))
            .unique();

        if (!installation) return;

        const existingRepo = await ctx.db
            .query("repos")
            .withIndex("by_repo_id", (q) => q.eq("githubRepoId", args.repoId))
            .unique();

        if (!existingRepo) {
            const newRepoId = await ctx.db.insert("repos", {
                installationId: installation._id,
                githubRepoId: args.repoId,
                name: args.name,
                fullName: args.fullName,
            });
            await ctx.scheduler.runAfter(0, api.githubSync.syncRepoData, {
                installId: args.installId,
                repoId: newRepoId,
                repoFullName: args.fullName,
            });
        }
    }
});

export const handlePROpened = mutation({
  args: {
    repoId: v.id("repos"),
    prNumber: v.number(),
    title: v.string(),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pullRequests")
      .withIndex("by_repo_and_pr", (q) =>
        q.eq("repoId", args.repoId).eq("prNumber", args.prNumber)
      )
      .unique();

    if (!existing) {
      return await ctx.db.insert("pullRequests", {
        repoId: args.repoId,
        prNumber: args.prNumber,
        title: args.title,
        author: args.author,
        state: "open",
        descriptionGenerated: false,
        nudge24hSent: false,
        nudge48hSent: false,
        openedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    return existing._id;
  },
});

export const markPRDescriptionGenerated = mutation({
  args: {
    repoFullName: v.string(),
    prNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const repo = await ctx.db
      .query("repos")
      .withIndex("by_repo_id") // Wait, I should use fullName or look up by ID.
      // Better to look up by fullName if available, or just use the repoId from previous steps.
      // For now, let's filter by fullName.
      .filter((q) => q.eq(q.field("fullName"), args.repoFullName))
      .unique();

    if (!repo) return;

    const pr = await ctx.db
      .query("pullRequests")
      .withIndex("by_repo_and_pr", (q) =>
        q.eq("repoId", repo._id).eq("prNumber", args.prNumber)
      )
      .unique();

    if (pr) {
      await ctx.db.patch(pr._id, {
        descriptionGenerated: true,
        updatedAt: Date.now(),
      });
    }
  },
});


export const handleIssue = mutation({
  args: {
    repoId: v.id("repos"),
    issueNumber: v.number(),
    title: v.string(),
    state: v.string(),
    assignee: v.optional(v.string()),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("issues")
      .withIndex("by_repo_and_issue", (q) =>
        q.eq("repoId", args.repoId).eq("issueNumber", args.issueNumber)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        state: args.state,
        assignee: args.assignee,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("issues", {
        repoId: args.repoId,
        issueNumber: args.issueNumber,
        title: args.title,
        state: args.state,
        assignee: args.assignee,
        url: args.url,
        updatedAt: Date.now(),
      });
    }
  },
});

export const handleIssueComment = mutation({
  args: {
    repoId: v.id("repos"),
    issueNumber: v.number(),
    commenter: v.string(),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("issues")
      .withIndex("by_repo_and_issue", (q) =>
        q.eq("repoId", args.repoId).eq("issueNumber", args.issueNumber)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        updatedAt: Date.now(),
      });
    }
  },
});

export const linkPRToIssue = mutation({
  args: {
    repoId: v.id("repos"),
    prNumber: v.number(),
    issueNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const pr = await ctx.db
      .query("pullRequests")
      .withIndex("by_repo_and_pr", (q) =>
        q.eq("repoId", args.repoId).eq("prNumber", args.prNumber)
      )
      .unique();

    if (pr) {
      await ctx.db.patch(pr._id, {
        linkedIssue: args.issueNumber,
        updatedAt: Date.now(),
      });
    }
  },
});

