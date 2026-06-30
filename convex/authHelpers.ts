import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function getUserRepoIds(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return [];
  const installations = await ctx.db
    .query("installations")
    .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
    .collect();
  if (installations.length === 0) return [];
  const repoIds: Id<"repos">[] = [];
  for (const inst of installations) {
    const instRepos = await ctx.db
      .query("repos")
      .filter((q) => q.eq(q.field("installationId"), inst._id))
      .collect();
    repoIds.push(...instRepos.map((r) => r._id));
  }
  return repoIds;
}

export async function isRepoOwner(ctx: QueryCtx | MutationCtx, repoId: Id<"repos">) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  const repo = await ctx.db.get(repoId);
  if (!repo) return false;
  const installation = await ctx.db.get(repo.installationId);
  if (!installation) return false;
  return installation.userId === identity.subject;
}
