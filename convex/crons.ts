import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();



// 2. Stale Branch Check - Every 6 hours
crons.cron(
  "check-stale-branches",
  "0 */6 * * *",
  api.activity.detectStaleBranches
);

// 3. Review Reminders - Every hour
crons.cron(
  "review-reminders",
  "0 * * * *",
  api.activity.sendReviewReminders
);

// 4. Continuous GitHub Repo Sync - Every hour
crons.cron(
  "continuous-github-sync",
  "0 * * * *",
  api.githubSync.syncAllRepos
);

export default crons;

