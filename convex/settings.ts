import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSettings = query({
  args: { installationId: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // If no specific installation, try to grab the first one (for simplified MVP setup)
    let installId = args.installationId;
    if (!installId) {
      const firstInstall = await ctx.db.query("installations").first();
      if (!firstInstall) return null;
      installId = firstInstall.githubInstallId;
    }

    let settings = await ctx.db
      .query("settings")
      .withIndex("by_installation", (q) => q.eq("installationId", installId))
      .unique();

    if (!settings) {
      // Default settings
      return {
        installationId: installId,
        staleThresholdDays: 7,
        activeWindowHours: 48,
      };
    }

    return settings;
  },
});

export const updateSettings = mutation({
  args: {
    installationId: v.number(),
    staleThresholdDays: v.number(),
    activeWindowHours: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_installation", (q) => q.eq("installationId", args.installationId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        staleThresholdDays: args.staleThresholdDays,
        activeWindowHours: args.activeWindowHours,
      });
    } else {
      await ctx.db.insert("settings", {
        installationId: args.installationId,
        staleThresholdDays: args.staleThresholdDays,
        activeWindowHours: args.activeWindowHours,
      });
    }
  },
});
