import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// ────────────────────────────────────────────────────
// 1. Raw Slack & Discord Fetch HTTP Dispatchers
// ────────────────────────────────────────────────────

export const dispatchSlackAlert = action({
  args: {
    webhookUrl: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    if (!args.webhookUrl) return;
    try {
      const res = await fetch(args.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args.payload),
      });
      if (!res.ok) {
        console.error(`Slack webhook response error: ${res.statusText}`);
      }
    } catch (err) {
      console.error("Failed to fetch Slack webhook:", err);
    }
  },
});

export const dispatchDiscordAlert = action({
  args: {
    webhookUrl: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    if (!args.webhookUrl) return;
    try {
      const res = await fetch(args.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args.payload),
      });
      if (!res.ok) {
        console.error(`Discord webhook response error: ${res.statusText}`);
      }
    } catch (err) {
      console.error("Failed to fetch Discord webhook:", err);
    }
  },
});

// ────────────────────────────────────────────────────
// 2. Rich Formatted Notifications Trigger Actions
// ────────────────────────────────────────────────────

export const triggerConflictNotification = action({
  args: {
    repoId: v.id("repos"),
    branch1: v.string(),
    branch2: v.string(),
    author1: v.string(),
    author2: v.string(),
    conflictingFiles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Fetch Repository Information
    const repos = await ctx.runQuery(api.activity.getRepos);
    const repo = repos.find((r: any) => r._id === args.repoId);
    if (!repo) return;

    // 2. Fetch Settings by githubInstallId
    const settings = await ctx.runQuery(api.settings.getSettings, {
      installationId: repo.githubInstallId,
    });
    if (!settings) return;

    // Slack Notification
    if (settings.slackWebhookUrl && settings.notifyOnConflicts !== false) {
      const filesList = args.conflictingFiles
        .slice(0, 5)
        .map((f) => `• \`${f.split("/").pop()}\``)
        .join("\n");
      const moreText =
        args.conflictingFiles.length > 5
          ? `\n• _and ${args.conflictingFiles.length - 5} more files..._`
          : "";

      const slackPayload = {
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "⚡ Recon | Merge Conflict Detected!",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Repository:* \`${repo.name}\`\n*Overlapping Branches:* \`${args.branch1}\` ↔ \`${args.branch2}\`\n*Authors Involved:* @${args.author1} and @${args.author2}`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Conflicting Files (${args.conflictingFiles.length}):*\n${filesList}${moreText}`,
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "View Conflict in Recon Dashboard",
                },
                url: `https://recon-henna.vercel.app/dashboard/conflicts`,
                style: "danger",
              },
            ],
          },
        ],
      };

      await ctx.runAction(api.notifications.dispatchSlackAlert, {
        webhookUrl: settings.slackWebhookUrl,
        payload: slackPayload,
      });
    }

    // Discord Notification
    if (settings.discordWebhookUrl && settings.notifyOnConflicts !== false) {
      const discordPayload = {
        embeds: [
          {
            title: "⚔️ Recon | Merge Conflict Detected!",
            description: `Overlapping code changes found in repository **${repo.name}**!`,
            color: 15548997, // Red
            fields: [
              {
                name: "Branches Involved",
                value: `\`${args.branch1}\` ↔ \`${args.branch2}\``,
                inline: true,
              },
              {
                name: "Authors",
                value: `@${args.author1} & @${args.author2}`,
                inline: true,
              },
              {
                name: `Conflicting Files (${args.conflictingFiles.length})`,
                value: args.conflictingFiles.slice(0, 6).map(f => `• \`${f}\``).join("\n"),
              },
            ],
            url: "https://recon-henna.vercel.app/dashboard/conflicts",
          },
        ],
      };

      await ctx.runAction(api.notifications.dispatchDiscordAlert, {
        webhookUrl: settings.discordWebhookUrl,
        payload: discordPayload,
      });
    }
  },
});

export const triggerDailyStandupNotification = action({
  args: {
    author: v.string(),
    yesterday: v.array(v.string()),
    today: v.array(v.string()),
    blockers: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Fetch settings to dispatch global team standup
    const settings = await ctx.runQuery(api.settings.getSettings, {});
    if (!settings) return;

    if (settings.slackWebhookUrl && settings.notifyDailyStandup !== false) {
      const yesterdayBullet = args.yesterday.map(y => `• ${y}`).join("\n") || "• None logged.";
      const todayBullet = args.today.map(t => `• ${t}`).join("\n") || "• None logged.";
      const blockersBullet = args.blockers.map(b => `• ${b}`).join("\n") || "• None reported.";

      const slackPayload = {
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "📝 Recon Daily Standup Update",
              emoji: true,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Developer:* @${args.author}\n*Date:* ${new Date().toLocaleDateString()}`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Yesterday's Accomplishments:*\n${yesterdayBullet}`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Focus for Today:*\n${todayBullet}`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Blockers:*\n${blockersBullet}`,
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Open Team Board",
                },
                url: "https://recon-henna.vercel.app/dashboard/standups",
              },
            ],
          },
        ],
      };

      await ctx.runAction(api.notifications.dispatchSlackAlert, {
        webhookUrl: settings.slackWebhookUrl,
        payload: slackPayload,
      });
    }
  },
});
