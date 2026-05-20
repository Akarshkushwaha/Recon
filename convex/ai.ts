import { action, mutation, query } from "./_generated/server";
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

    // 4. Trigger Slack Daily Notification Update
    try {
      await ctx.runAction(api.notifications.triggerDailyStandupNotification, {
        author: args.author,
        yesterday: parsed.yesterday || [],
        today: parsed.today || [],
        blockers: parsed.blockers || [],
      });
    } catch (e) {
      console.error("Failed to post daily standup notification:", e);
    }
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

export const saveAIReview = mutation({
  args: {
    repoId: v.id("repos"),
    branchName: v.string(),
    feedback: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("aiReviews")
      .withIndex("by_repo_and_branch", (q) =>
        q.eq("repoId", args.repoId).eq("branchName", args.branchName)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        feedback: args.feedback,
        status: args.status,
        reviewedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("aiReviews", {
        repoId: args.repoId,
        branchName: args.branchName,
        feedback: args.feedback,
        status: args.status,
        reviewedAt: Date.now(),
      });
    }
  },
});

export const getAIReview = query({
  args: {
    repoId: v.id("repos"),
    branchName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiReviews")
      .withIndex("by_repo_and_branch", (q) =>
        q.eq("repoId", args.repoId).eq("branchName", args.branchName)
      )
      .unique();
  },
});

export const getBranchActivityForReview = query({
  args: {
    repoId: v.id("repos"),
    branchName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("branchActivity")
      .withIndex("by_repo_and_branch", (q) =>
        q.eq("repoId", args.repoId).eq("branchName", args.branchName)
      )
      .unique();
  },
});

export const requestAICodeReview = action({
  args: {
    repoId: v.id("repos"),
    branchName: v.string(),
  },
  handler: async (ctx, args): Promise<{ feedback: string; status: string }> => {
    // 1. Fetch branch activity to get filesChanged
    const branchActivity = await ctx.runQuery((api.ai as any).getBranchActivityForReview, {
      repoId: args.repoId,
      branchName: args.branchName,
    });

    const files = branchActivity?.filesChanged || [];
    const filesList = files.length > 0 ? files.join(", ") : "No specific files logged (general branch analysis).";

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an elite, senior AI Code Reviewer. You analyze the list of changed files and provide a highly detailed, professional, and actionable code review.
          Structure your review in beautifully formatted Markdown:
          
          # AI Code Review: \`${args.branchName}\`
          
          Provide a summary of the branch focus based on files changed: \`${filesList}\`.
          
          ### 🚨 Security & Bug Prevention
          - Check for common security vulnerabilities (XSS, injections, unhandled errors, secret leaks).
          - Provide concrete recommendations.
          
          ### ⚡ Performance & Complexity
          - Identify potential bottlenecks (unnecessary re-renders, slow database queries, loops).
          
          ### 🧼 Code Style & Maintainability
          - Check structure, TypeScript types, readability, naming conventions.
          
          ### 📊 Summary Status
          Conclude with a final rating of the branch quality. Highlight if there are "CRITICAL" blockers or if it's "CLEAN".
          Provide a rating block like:
          [RATING: CLEAN | WARNINGS | CRITICAL]`,
        },
        {
          role: "user",
          content: `Review the changes in the branch "${args.branchName}" which modified: ${filesList}.`,
        },
      ],
    });

    const feedback = response.choices[0].message.content || "Failed to generate review.";
    
    // Determine status
    let status = "clean";
    if (feedback.toUpperCase().includes("RATING: CRITICAL")) {
      status = "critical";
    } else if (feedback.toUpperCase().includes("RATING: WARNINGS") || feedback.toUpperCase().includes("WARNING")) {
      status = "warnings";
    }

    // Save review
    await ctx.runMutation((api.ai as any).saveAIReview, {
      repoId: args.repoId,
      branchName: args.branchName,
      feedback,
      status,
    });

    return { feedback, status };
  },
});

export const saveSprintBriefing = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sprintBriefings", {
      title: args.title,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const getSprintBriefings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("sprintBriefings")
      .order("desc")
      .take(10);
  },
});

export const generateSprintBriefing = action({
  args: {},
  handler: async (ctx): Promise<{ title: string; content: string }> => {
    // 1. Fetch branch activity from last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentActivity = await ctx.runQuery(api.activity.getRecentActivity, {
      since: sevenDaysAgo,
    });

    // 2. Fetch conflicts
    const conflicts = await ctx.runQuery(api.activity.getActiveConflicts, {});

    // 3. Format activity details
    const activitySummary = recentActivity.map((a: any) => 
      `- Developer **${a.authorLogin}** pushed ${a.commitCount} commits to \`${a.branchName}\`. Changed files: ${a.filesChanged.join(', ')}`
    ).join("\n");

    const conflictsSummary = conflicts.map((c: any) =>
      `- Potential conflict on branch \`${c.branch1}\` & \`${c.branch2}\` by **${c.author1}** & **${c.author2}** touching: ${c.conflictingFiles.join(', ')}`
    ).join("\n") || "No unresolved branch conflicts detected this week.";

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an elite Agile Project Director. Synthesize a premium, 2-page print-ready Weekly Sprint Briefing based on the following engineering telemetry.
          Your response MUST be in beautiful Markdown with exact sections:
          
          # 📋 Weekly Sprint Briefing
          
          ## ⚡ Executive Summary
          Provide a sleek high-level overview of team focus, velocity, and health.
          
          ## 👥 Engineering Telemetry & Contributions
          Detail what each developer worked on, listing key files touched and highlighting their impact.
          
          ## ⚠️ Architectural Risks & Overlaps
          Explicitly list active branch overlaps, merge conflicts, or high-density directories touched by multiple developers.
          
          ## 🚀 Recommended Sprint Objectives
          Outline concrete, strategic objectives for the upcoming standup/planning meeting.
          
          Use rich typography, bullet points, and clean spacing. Make it look professional enough to present directly to a CTO/VPE.`,
        },
        {
          role: "user",
          content: `Here is the engineering telemetry:
          
          ### WEEKLY ACTIVITY SUMMARY
          ${activitySummary || "No activity logged."}
          
          ### ACTIVE RISK MATRIX
          ${conflictsSummary}`,
        },
      ],
    });

    const content = response.choices[0].message.content || "Failed to generate sprint briefing.";
    
    // Function to calculate week number
    const today = new Date();
    const target = new Date(today.valueOf());
    const dayNumber = (today.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNumber + 3);
    const firstThursday = target.valueOf();
    target.setUTCMonth(0, 1);
    if (target.getUTCDay() !== 4) {
      target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    const title = `Sprint Briefing - W${weekNumber} ${today.getFullYear()}`;

    await ctx.runMutation((api.ai as any).saveSprintBriefing, {
      title,
      content,
    });

    return { title, content };
  },
});

export const saveBurnoutAlert = mutation({
  args: {
    developer: v.string(),
    reason: v.string(),
    activityCount: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if duplicate alert exists
    const recent = await ctx.db
      .query("burnoutAlerts")
      .filter((q) =>
        q.and(
          q.eq(q.field("developer"), args.developer),
          q.eq(q.field("dismissed"), false)
        )
      )
      .first();

    if (!recent) {
      await ctx.db.insert("burnoutAlerts", {
        developer: args.developer,
        reason: args.reason,
        activityCount: args.activityCount,
        dismissed: false,
        createdAt: Date.now(),
      });
    }
  },
});

export const getBurnoutAlerts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("burnoutAlerts")
      .filter((q) => q.eq(q.field("dismissed"), false))
      .collect();
  },
});

export const dismissBurnoutAlert = mutation({
  args: { id: v.id("burnoutAlerts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { dismissed: true });
  },
});

export const detectBurnout = action({
  args: {},
  handler: async (ctx): Promise<{ developer: string; reason: string }[]> => {
    // Scan branch activity from the last 48h
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
    const activities = await ctx.runQuery(api.activity.getRecentActivity, {
      since: fortyEightHoursAgo,
    });

    const devMetrics: Record<string, { totalPushes: number; lateNightPushes: number }> = {};

    for (const act of activities) {
      const dev = act.authorLogin;
      if (!devMetrics[dev]) {
        devMetrics[dev] = { totalPushes: 0, lateNightPushes: 0 };
      }
      devMetrics[dev].totalPushes += 1;

      // Check if lastPushTimestamp was late night (between 10 PM and 6 AM developer's UTC/local time)
      const date = new Date(act.lastPushTimestamp);
      const hour = date.getUTCHours();
      
      if (hour >= 22 || hour <= 6) {
        devMetrics[dev].lateNightPushes += 1;
      }
    }

    const alertsGenerated = [];
    for (const [dev, metrics] of Object.entries(devMetrics)) {
      if (metrics.lateNightPushes >= 2) {
        const reason = `High-density coding detected after midnight (${metrics.lateNightPushes} late-night pushes in 48h).`;
        await ctx.runMutation((api.ai as any).saveBurnoutAlert, {
          developer: dev,
          reason,
          activityCount: metrics.totalPushes,
        });
        alertsGenerated.push({ developer: dev, reason });
      }
    }

    return alertsGenerated;
  },
});

export const getAllBranches = query({
  args: {},
  handler: async (ctx) => {
    const branches = await ctx.db.query("branchActivity").collect();
    const branchesWithRepo = await Promise.all(
      branches.map(async (branch) => {
        const repo = await ctx.db.get(branch.repoId);
        return {
          ...branch,
          repoName: repo?.name || "Unknown Repo",
        };
      })
    );
    return branchesWithRepo;
  },
});

export const resolveConflictAI = action({
  args: {
    branch1: v.string(),
    branch2: v.string(),
    author1: v.string(),
    author2: v.string(),
    filePath: v.string(),
    branch1Code: v.string(),
    branch2Code: v.string(),
  },
  handler: async (ctx, args): Promise<{ resolvedCode: string; explanation: string }> => {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an elite principal engineer specializing in git merge conflict resolution.
          You will receive the filepath, the two conflicting branches, the two authors, and the file contents from both branches.
          Your task is to merge the two versions into a single, flawless, compile-ready version.
          Retain important functionality from both branches where possible. If there's a conflict in design tokens or themes, synthesize a highly elegant combination.
          
          You MUST respond in JSON format with exactly two fields:
          1. "resolvedCode": (the complete resolved file content as a string)
          2. "explanation": (a short markdown explanation of how you resolved the conflict, highlighting what you kept from each author)
          
          Do NOT wrap the code in markdown code fences within the JSON. Return raw valid JSON.`,
        },
        {
          role: "user",
          content: JSON.stringify({
            filePath: args.filePath,
            branch1: args.branch1,
            branch2: args.branch2,
            author1: args.author1,
            author2: args.author2,
            branch1Code: args.branch1Code,
            branch2Code: args.branch2Code,
          }),
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as { resolvedCode: string; explanation: string };
  },
});

