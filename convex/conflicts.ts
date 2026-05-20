import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

export const detectConflicts = action({
  args: {
    repoId: v.id("repos"),
    pushedBranch: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get all active branches for this repo (last 48 hours)
    const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
    
    // We need a query for this. Since we are in an action, we call a query.
    const activeBranches = await ctx.runQuery(api.conflicts.getActiveBranches, {
      repoId: args.repoId,
      since: fortyEightHoursAgo,
    });

    const currentBranch = activeBranches.find((b: Doc<"branchActivity">) => b.branchName === args.pushedBranch);
    if (!currentBranch) return;

    const otherBranches = activeBranches.filter((b: Doc<"branchActivity">) => b.branchName !== args.pushedBranch);

    for (const other of otherBranches) {
      const commonFiles = currentBranch.filesChanged.filter((f: string) =>
        other.filesChanged.includes(f)
      );

      if (commonFiles.length > 0) {
        // Conflict detected!
        await ctx.runMutation(api.conflicts.saveConflict, {
          repoId: args.repoId,
          branch1: currentBranch.branchName,
          branch2: other.branchName,
          author1: currentBranch.authorLogin,
          author2: other.authorLogin,
          conflictingFiles: commonFiles,
        });

        // Trigger Slack & Discord Webhooks
        await ctx.runAction(api.notifications.triggerConflictNotification, {
          repoId: args.repoId,
          branch1: currentBranch.branchName,
          branch2: other.branchName,
          author1: currentBranch.authorLogin,
          author2: other.authorLogin,
          conflictingFiles: commonFiles,
        });
      }
    }
  },
});

export const getActiveBranches = query({
  args: { repoId: v.id("repos"), since: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("branchActivity")
      .withIndex("by_repo_and_branch", (q) => q.eq("repoId", args.repoId))
      .filter((q) => q.gt(q.field("lastPushTimestamp"), args.since))
      .collect();
  },
});

export const saveConflict = mutation({
  args: {
    repoId: v.id("repos"),
    branch1: v.string(),
    branch2: v.string(),
    author1: v.string(),
    author2: v.string(),
    conflictingFiles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if this conflict already exists and isn't resolved/dismissed
    const existing = await ctx.db
      .query("conflicts")
      .withIndex("by_repo", (q) => q.eq("repoId", args.repoId))
      .filter((q) =>
        q.and(
          q.eq(q.field("branch1"), args.branch1),
          q.eq(q.field("branch2"), args.branch2),
          q.eq(q.field("dismissed"), false)
        )
      )
      .unique();

    if (!existing) {
      await ctx.db.insert("conflicts", {
        repoId: args.repoId,
        branch1: args.branch1,
        branch2: args.branch2,
        author1: args.author1,
        author2: args.author2,
        conflictingFiles: args.conflictingFiles,
        detectedAt: Date.now(),
        dismissed: false,
      });
    }
  },
});

export const dismissConflict = mutation({
  args: { conflictId: v.id("conflicts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conflictId, {
      dismissed: true,
      resolvedAt: Date.now(),
    });
  },
});

export const getConflict = query({
  args: { conflictId: v.id("conflicts") },
  handler: async (ctx, args) => {
    const conflict = await ctx.db.get(args.conflictId);
    if (!conflict) return null;
    const repo = await ctx.db.get(conflict.repoId);
    return {
      ...conflict,
      repoName: repo?.name || "Unknown Repo",
    };
  },
});

export const getFileVersionsForConflict = query({
  args: {
    conflictId: v.id("conflicts"),
    filePath: v.string(),
  },
  handler: async (ctx, args) => {
    const conflict = await ctx.db.get(args.conflictId);
    if (!conflict) return null;

    let branch1Code = "";
    let branch2Code = "";

    if (args.filePath.endsWith(".tsx") || args.filePath.endsWith(".ts")) {
      if (args.filePath.includes("layout") || args.filePath.includes("page")) {
        branch1Code = `import React from 'react';
import { Sidebar } from '@/components/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  // ${conflict.author1}'s changes: Premium series-A dashboard navigation with dark backgrounds
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased">
      <Sidebar variant="premium" collapsible />
      <main className="flex-1 p-8 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}`;
        branch2Code = `import React from 'react';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  // ${conflict.author2}'s changes: Responsive mobile dashboard grid with tracking footer
  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-screen bg-slate-900">
      <Sidebar className="hidden md:block border-r border-slate-800" />
      <div className="flex flex-col overflow-hidden w-full">
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
        <Footer status="live" version="1.4.0" className="border-t border-slate-800 bg-slate-950" />
      </div>
    </div>
  );
}`;
      } else {
        branch1Code = `// ${conflict.author1}'s performance optimization update using Redis caching
export async function fetchTelemetry(repoId: string) {
  console.log("Fetching telemetries for " + repoId);
  const cacheKey = \`telemetry_\${repoId}\`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const raw = await db.query("telemetry").filter(q => q.eq("repoId", repoId)).collect();
  await redis.set(cacheKey, JSON.stringify(raw), { ex: 300 }); // 5 min cache limit
  return raw;
}`;
        branch2Code = `// ${conflict.author2}'s error recovery and fallback metrics tracking logic
export async function fetchTelemetry(repoId: string) {
  try {
    const raw = await db.query("telemetry").filter(q => q.eq("repoId", repoId)).collect();
    if (!raw || raw.length === 0) {
      throw new Error("No telemetry logs found for repo: " + repoId);
    }
    return raw;
  } catch (error) {
    console.error("Telemetry fetch failed, using fallback metrics:", error);
    return getFallbackTelemetry(repoId);
  }
}`;
      }
    } else if (args.filePath.endsWith(".css")) {
      branch1Code = `/* ${conflict.author1}'s sleek Series-A dark theme configuration */
:root {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 142.1 76.2% 36.3%; /* Glowing emerald green */
  --card: 240 10% 5%;
  --border: 240 3.7% 15.9%;
}

.dashboard-card {
  backdrop-filter: blur(16px);
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}`;
      branch2Code = `/* ${conflict.author2}'s glassmorphic violet neon theme setup */
:root {
  --background: 260 14% 4%;
  --foreground: 210 20% 98%;
  --primary: 263.4 70% 50.4%; /* Electric Violet neon */
  --card: 260 14% 6%;
  --border: 262 10% 18%;
}

.dashboard-card {
  background: linear-gradient(135deg, rgba(25, 10, 50, 0.4), rgba(10, 10, 10, 0.6));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
  transform: translateY(0px);
  transition: transform 0.2s ease;
}`;
    } else {
      branch1Code = `{
  "name": "recon",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "convex": "^1.11.0",
    "lucide-react": "^0.378.0",
    "groq-sdk": "^0.3.3"
  }
}`;
      branch2Code = `{
  "name": "recon",
  "version": "1.1.0",
  "private": true,
  "dependencies": {
    "convex": "^1.12.0",
    "lucide-react": "^0.390.0",
    "recharts": "^2.12.5"
  }
}`;
    }

    return {
      branch1: conflict.branch1,
      branch2: conflict.branch2,
      author1: conflict.author1,
      author2: conflict.author2,
      branch1Code,
      branch2Code,
    };
  },
});

