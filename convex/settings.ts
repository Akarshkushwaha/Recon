import { mutation, query, action, internalMutation, internalQuery, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { App } from "@octokit/app";
import { internal } from "./_generated/api";

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
  args: { githubUsernames: v.array(v.string()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Find unclaimed installations
    const installations = await ctx.db.query("installations").collect();
    let claimedCount = 0;

    for (const inst of installations) {
      const lowercasedUsernames = args.githubUsernames.map(u => u.toLowerCase());
      if (!inst.userId && lowercasedUsernames.includes(inst.accountLogin.toLowerCase())) {
        await ctx.db.patch(inst._id, { userId: identity.subject });
        claimedCount++;
      }
    }
    return claimedCount;
  }
});

export const _claimInstallationSecurely = internalMutation({
  args: { installationId: v.id("installations"), userId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.installationId, { userId: args.userId });
  }
});

export const linkInstallationId = action({
  args: { githubInstallId: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // Fetch the installation from DB
    // We have to use a query to get the installation since we are in an action
    const installation = await ctx.runQuery(internal.settings._getInstallationForLinking, { githubInstallId: args.githubInstallId });
    if (!installation) throw new Error("Installation not found. Please ensure the GitHub App is installed correctly.");
    
    if (installation.userId) {
       if (installation.userId === identity.subject) return "already_claimed";
       throw new Error("Installation already claimed by another user");
    }

    if (installation.accountType === "User") {
      if (installation.accountLogin.toLowerCase() !== identity.nickname?.toLowerCase()) {
        throw new Error(`Security Error: You are logged in as ${identity.nickname}, but this installation belongs to ${installation.accountLogin}.`);
      }
    } else {
      // It's an organization. We need to verify if the user has access.
      if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_APP_PRIVATE_KEY) {
         throw new Error("GitHub App credentials missing on the server.");
      }

      try {
        const app = new App({
          appId: process.env.GITHUB_APP_ID,
          privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
        });
        const octokit = await app.getInstallationOctokit(args.githubInstallId);
        
        // Check if the user is a member of the organization
        // We catch errors (like 404 if not a member, or 403 if app lacks permissions)
        let isMember = false;
        try {
          // If the app has org member read permissions, this works
          await octokit.request("GET /orgs/{org}/members/{username}", {
            org: installation.accountLogin,
            username: identity.nickname || "",
          });
          isMember = true;
        } catch (e: any) {
          if (e.status === 404) {
             throw new Error(`You must be a member of the organization ${installation.accountLogin} to link it.`);
          }
          // If it fails with 403, the app might not have org member permissions. 
          // We can fallback to checking if they are a collaborator on any repo in the installation.
          console.warn("Falling back to repository collaborator check for organization verification.");
          const { data: repos } = await octokit.request("GET /installation/repositories", { per_page: 5 });
          if (repos.repositories.length > 0) {
            const firstRepo = repos.repositories[0];
            try {
               await octokit.request("GET /repos/{owner}/{repo}/collaborators/{username}", {
                  owner: installation.accountLogin,
                  repo: firstRepo.name,
                  username: identity.nickname || "",
               });
               isMember = true;
            } catch (fallbackError: any) {
               if (fallbackError.status === 404) {
                 throw new Error(`You must be a collaborator on the organization's repositories to link it.`);
               }
               throw fallbackError;
            }
          } else {
            throw new Error(`The organization ${installation.accountLogin} has no repositories installed to verify your access.`);
          }
        }
      } catch (err: any) {
         throw new Error(err.message || "Failed to verify organization membership with GitHub.");
      }
    }

    await ctx.runMutation(internal.settings._claimInstallationSecurely, { 
      installationId: installation._id, 
      userId: identity.subject 
    });
    return "claimed";
  }
});

export const _getInstallationForLinking = internalQuery({
  args: { githubInstallId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("installations")
      .withIndex("by_install_id", (q) => q.eq("githubInstallId", args.githubInstallId))
      .unique();
  }
});
