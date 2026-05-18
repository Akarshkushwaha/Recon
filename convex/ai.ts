import { action } from "./_generated/server";
import { v } from "convex/values";
import { Groq } from "groq-sdk";
import { api } from "./_generated/api";

export const parseIssue = action({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a technical project manager. Parse the user's natural language input into a GitHub Issue JSON.
          Return ONLY JSON with the following fields: 
          - title: string
          - body: string (detailed description)
          - labels: string[] (suggest relevant labels)
          - assignee: string | null (extract if mentioned)
          - estimate: string | null (e.g. "2 days")`,
        },
        {
          role: "user",
          content: args.text,
        },
      ],
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  },
});

export const generateStandup = action({
  args: { author: v.string() },
  handler: async (ctx, args) => {
    // 1. Fetch activity from the last 24h
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentActivity = await ctx.runQuery(api.activity.getRecentActivity, {
      since: twentyFourHoursAgo,
    });

    const userActivity = recentActivity.filter((a: any) => a.authorLogin === args.author);

    if (userActivity.length === 0) {
      // No activity
      await ctx.runMutation(api.activity.saveStandup, {
        author: args.author,
        yesterday: ["No code changes pushed yesterday."],
        today: ["Continuing planned work."],
        blockers: [],
        date: new Date().toISOString().split("T")[0],
      });
      return;
    }

    // 2. Format activity into a prompt
    const activityText = userActivity.map((a: any) => 
      `Pushed ${a.commitCount} commits to ${a.branchName}. Modified files: ${a.filesChanged.join(', ')}`
    ).join("\n");

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a technical project manager. Based on the following push activity from a developer, generate a daily standup.
          Return ONLY JSON with the following fields (arrays of strings):
          - yesterday: (what they did, based on the activity)
          - today: (logical next steps based on what they did)
          - blockers: (any potential blockers inferred, or empty array)
          Keep it concise and professional.`,
        },
        {
          role: "user",
          content: activityText,
        },
      ],
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(response.choices[0].message.content || "{}");

    // 3. Save to DB
    await ctx.runMutation(api.activity.saveStandup, {
      author: args.author,
      yesterday: parsed.yesterday || [],
      today: parsed.today || [],
      blockers: parsed.blockers || [],
      date: new Date().toISOString().split("T")[0],
    });
  },
});

export const generateChangelog = action({
  args: {},
  handler: async (ctx) => {
    // 1. Fetch activity from the last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentActivity = await ctx.runQuery(api.activity.getRecentActivity, {
      since: sevenDaysAgo,
    });

    if (recentActivity.length === 0) {
      return;
    }

    // 2. Format activity into a prompt
    const activityText = recentActivity.map((a: any) => 
      `${a.authorLogin} pushed ${a.commitCount} commits to ${a.branchName}. Modified files: ${a.filesChanged.join(', ')}`
    ).join("\n");

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a technical product manager. Based on the following push activity over the last 7 days, generate a professional, customer-facing weekly Changelog / Release Notes in Markdown format.
          Group things logically (e.g. "New Features", "Bug Fixes", "Internal Improvements").
          Make it sound exciting and polished.
          Do NOT wrap the markdown in a JSON object, just return the raw markdown string.`,
        },
        {
          role: "user",
          content: activityText,
        },
      ],
    });

    const markdownContent = response.choices[0].message.content || "No activity to report.";

    // 3. Save to DB
    await ctx.runMutation(api.changelogs.saveChangelog, {
      title: `Weekly Release - ${new Date().toISOString().split("T")[0]}`,
      content: markdownContent,
      startDate: sevenDaysAgo,
      endDate: Date.now(),
    });
  },
});
