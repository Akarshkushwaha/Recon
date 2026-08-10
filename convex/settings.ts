import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

async function isInstallationOwner(ctx: QueryCtx | MutationCtx, githubInstallId: number) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;

  const installation = await ctx.db
    .query("installations")
    .withIndex("by_install_id", (q) => q.eq("githubInstallId", githubInstallId))
    .unique();

  return installation?.userId === identity.subject;
}

export const getSettings = query({
  args: { installationId: v.optional(v.number()) },
  handler: async (ctx, args) => {
    // If no specific installation, try to grab the first one belonging to the user
    let installId = args.installationId;
    if (!installId) {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) return null;
      const allInstalls = await ctx.db.query("installations").collect();
      const firstInstall = allInstalls.find(
        (inst) => inst.userId === identity.subject
      );
      if (!firstInstall) return null;
      installId = firstInstall.githubInstallId;
    } else {
      if (!(await isInstallationOwner(ctx, installId))) return null;
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

        notifyStaleBranches: true,
      };
    }

    return {
      ...settings,
      slackWebhookUrl: settings.slackWebhookUrl || "",
      discordWebhookUrl: settings.discordWebhookUrl || "",
      notifyOnConflicts: settings.notifyOnConflicts ?? true,

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

    notifyStaleBranches: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (!(await isInstallationOwner(ctx, args.installationId))) {
      throw new Error("Unauthorized");
    }

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

export const claimInstallation = mutation({
  args: { githubInstallId: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const installation = await ctx.db
      .query("installations")
      .withIndex("by_install_id", (q) => q.eq("githubInstallId", args.githubInstallId))
      .unique();

    if (!installation) throw new Error("Installation not found");
    if (installation.userId) {
       if (installation.userId === identity.subject) return "already_claimed";
       throw new Error("Installation already claimed by another user");
    }

    await ctx.db.patch(installation._id, { userId: identity.subject });
    return "claimed";
  }
});
