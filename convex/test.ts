import { query } from "./_generated/server";

export const getInstalls = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("installations").collect();
  }
});
