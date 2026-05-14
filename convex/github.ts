import { action } from "./_generated/server";
import { v } from "convex/values";
import { App } from "@octokit/app";
import { api } from "./_generated/api";

export const createGitHubIssue = action({
  args: {
    installId: v.number(),
    repoFullName: v.string(),
    title: v.string(),
    body: v.string(),
    labels: v.optional(v.array(v.string())),
    assignee: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const app = new App({
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
    });
    const octokit = await app.getInstallationOctokit(args.installId);
    
    const [owner, repo] = args.repoFullName.split("/");

    const response = await octokit.request("POST /repos/{owner}/{repo}/issues", {
      owner,
      repo,
      title: args.title,
      body: args.body,
      labels: args.labels,
      assignees: args.assignee ? [args.assignee] : undefined,
    });

    return response.data.number;
  },
});

export const processPRDescription = action({
  args: {
    installId: v.number(),
    repoFullName: v.string(),
    prNumber: v.number(),
  },
  handler: async (ctx, args) => {
    const app = new App({
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
    });
    const octokit = await app.getInstallationOctokit(args.installId);
    const [owner, repo] = args.repoFullName.split("/");

    // 1. Fetch PR Diff
    const { data: diff } = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
      owner,
      repo,
      pull_number: args.prNumber,
      headers: {
        accept: "application/vnd.github.v3.diff",
      },
    });

    // 2. Generate Description via Gemini
    const description = await ctx.runAction(api.gemini.generatePRDescription, {
      diff: diff as unknown as string,
    });

    // 3. Update PR on GitHub
    await octokit.request("PATCH /repos/{owner}/{repo}/pulls/{pull_number}", {
      owner,
      repo,
      pull_number: args.prNumber,
      body: description,
    });

    // 4. Update Convex state
    await ctx.runMutation(api.webhooks.markPRDescriptionGenerated, {
      repoFullName: args.repoFullName,
      prNumber: args.prNumber,
    });
  },
});
