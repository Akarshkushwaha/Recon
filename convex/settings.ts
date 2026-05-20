import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSettings = query({
  args: { installationId: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // If no specific installation, try to grab the first one
    let installId = args.installationId;
    if (!installId) {
      const firstInstall = await ctx.db.query("installations").first();
      if (!firstInstall) return null;
      installId = firstInstall.githubInstallId;
    }

    const settings = await ctx.db
      .query("settings")
      .withIndex("by_installation", (q) => q.eq("installationId", installId!))
      .unique();

    if (!settings) {
      // Default settings
      return {
        installationId: installId,
        staleThresholdDays: 7,
        activeWindowHours: 48,
        slackWebhookUrl: "",
        discordWebhookUrl: "",
        notifyOnConflicts: true,
        notifyDailyStandup: true,
        notifyStaleBranches: true,
      };
    }

    return {
      ...settings,
      slackWebhookUrl: settings.slackWebhookUrl || "",
      discordWebhookUrl: settings.discordWebhookUrl || "",
      notifyOnConflicts: settings.notifyOnConflicts ?? true,
      notifyDailyStandup: settings.notifyDailyStandup ?? true,
      notifyStaleBranches: settings.notifyStaleBranches ?? true,
    };
  },
});

export const updateSettings = mutation({
  args: {
    installationId: v.number(),
    staleThresholdDays: v.number(),
    activeWindowHours: v.number(),
    slackWebhookUrl: v.optional(v.string()),
    discordWebhookUrl: v.optional(v.string()),
    notifyOnConflicts: v.optional(v.boolean()),
    notifyDailyStandup: v.optional(v.boolean()),
    notifyStaleBranches: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_installation", (q) => q.eq("installationId", args.installationId))
      .unique();

    const patchData = {
      staleThresholdDays: args.staleThresholdDays,
      activeWindowHours: args.activeWindowHours,
      slackWebhookUrl: args.slackWebhookUrl || "",
      discordWebhookUrl: args.discordWebhookUrl || "",
      notifyOnConflicts: args.notifyOnConflicts ?? true,
      notifyDailyStandup: args.notifyDailyStandup ?? true,
      notifyStaleBranches: args.notifyStaleBranches ?? true,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patchData);
    } else {
      await ctx.db.insert("settings", {
        installationId: args.installationId,
        ...patchData,
      });
    }
  },
});
