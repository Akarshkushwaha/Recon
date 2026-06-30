import { action, query } from "./_generated/server";
import { v } from "convex/values";
import { Groq } from "groq-sdk";
import { api } from "./_generated/api";
import { isRepoOwner } from "./authHelpers";

export const getTeamTelemetry = query({
  args: { repoId: v.id("repos") },
  handler: async (ctx, args) => {
    if (!(await isRepoOwner(ctx, args.repoId))) {
      return [];
    }

    // 1. Fetch all commits, branchActivity, PRs, and issues for the selected repo
    const commits = await ctx.db
      .query("commits")
      .withIndex("by_repo", (q) => q.eq("repoId", args.repoId))
      .order("desc")
      .take(100);
      
    const branchActivity = await ctx.db
      .query("branchActivity")
      .withIndex("by_repo_and_branch", (q) => q.eq("repoId", args.repoId))
      .collect();
      
    const pullRequests = await ctx.db
      .query("pullRequests")
      .withIndex("by_repo_and_pr", (q) => q.eq("repoId", args.repoId))
      .order("desc")
      .take(50);
      
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_repo", (q) => q.eq("repoId", args.repoId))
      .order("desc")
      .take(50);

    // 2. Group by developer (authorLogin)
    const team: Record<string, any> = {};

    // Group active branches
    for (const branch of branchActivity) {
      if (!team[branch.authorLogin]) {
        team[branch.authorLogin] = {
          authorLogin: branch.authorLogin,
          authorAvatar: branch.authorAvatar,
          commits: [],
          activeBranches: [],
          pullRequests: [],
          issues: [],
        };
      }
      team[branch.authorLogin].activeBranches.push(branch);
    }

    // Assign commits to developers
    for (const commit of commits) {
      if (!team[commit.authorLogin]) {
        team[commit.authorLogin] = {
          authorLogin: commit.authorLogin,
          authorAvatar: commit.authorAvatar,
          commits: [],
          activeBranches: [],
          pullRequests: [],
          issues: [],
        };
      }
      if (team[commit.authorLogin].commits.length < 5) {
        team[commit.authorLogin].commits.push(commit);
      }
    }

    // Assign PRs to developers
    for (const pr of pullRequests) {
      if (team[pr.author]) {
        team[pr.author].pullRequests.push(pr);
      }
    }

    // Assign issues to developers
    for (const issue of issues) {
      if (issue.assignee && team[issue.assignee]) {
        team[issue.assignee].issues.push(issue);
      }
    }

    return Object.values(team);
  },
});

export const inferFeatureWork = action({
  args: { authorLogin: v.string(), commits: v.array(v.any()) },
  handler: async (ctx, args) => {
    if (args.commits.length === 0) return "No recent activity detected.";

    const commitMessages = args.commits.map((c: any) => `- [${c.branchName}] ${c.message}`).join("\n");

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are an engineering manager. Look at the developer's recent commit messages and summarize in ONE short sentence what specific feature or task they are currently working on. Do not list the commits. Keep it professional, concise, and to the point. Example: 'Sarah is currently implementing the Stripe billing webhook.'",
        },
        {
          role: "user",
          content: `Recent commits for ${args.authorLogin}:\n${commitMessages}`,
        },
      ],
    });

    return response.choices[0].message.content || "Unable to infer current focus.";
  },
});
