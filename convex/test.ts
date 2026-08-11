import { query } from "./_generated/server";

export const testPRs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("pullRequests").collect();
  }
});

export const testActivity = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("branchActivity").collect();
  }
});

export const testAlerts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("staleAlerts").collect();
  }
});

export const testConflicts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("conflicts").collect();
  }
});
