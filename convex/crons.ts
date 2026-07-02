import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// 1. Standup Digest - Daily at 3:00 AM UTC (8:30 AM IST)
crons.cron(
  "generate-daily-standup",
  "0 3 * * *",
  api.activity.generateStandups
);

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

