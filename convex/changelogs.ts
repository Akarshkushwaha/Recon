import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveChangelog = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("changelogs", {
      title: args.title,
      content: args.content,
      startDate: args.startDate,
      endDate: args.endDate,
      createdAt: Date.now(),
    });
  },
});

export const getChangelogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("changelogs")
      .order("desc")
      .take(20);
  },
});
