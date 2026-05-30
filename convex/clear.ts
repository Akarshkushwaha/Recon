import { mutation } from "./_generated/server";
export const all = mutation({ args: {}, handler: async (ctx) => { const conflicts = await ctx.db.query("conflicts").collect(); for (const c of conflicts) { await ctx.db.delete(c._id); } const branches = await ctx.db.query("branchActivity").collect(); for (const b of branches) { await ctx.db.delete(b._id); } } });
