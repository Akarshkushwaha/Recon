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
