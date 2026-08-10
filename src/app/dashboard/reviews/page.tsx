"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { GitPullRequest, GitMerge, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ReviewsPage() {
  const insights = useQuery(api.reviews.getReviewInsights);

  if (!insights) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const { assignedToMe, awaitingOthers, stuck, conflictBlocked } = insights;

  const PRCard = ({ pr, type }: { pr: any; type: 'assigned' | 'awaiting' | 'stuck' | 'conflict' }) => {
    let Icon = GitPullRequest;
    let colorClass = "text-blue-400";
    let statusText = "Open";

    if (type === 'conflict') {
      Icon = AlertCircle;
      colorClass = "text-rose-500";
      statusText = "Merge Conflict";
    } else if (type === 'stuck') {
      Icon = Clock;
      colorClass = "text-orange-500";
      statusText = `Stuck (>48h)`;
    } else if (type === 'assigned') {
      Icon = GitMerge;
      colorClass = "text-purple-400";
      statusText = "Needs Your Review";
    }

    return (
      <a 
        href={pr.url} 
        target="_blank" 
        rel="noreferrer"
        className="block p-4 bg-card/50 hover:bg-card border border-border rounded-xl transition-all hover:scale-[1.01] hover:shadow-lg hover:border-primary/30 group relative overflow-hidden"
      >
        <div className={`absolute top-0 left-0 w-1 h-full bg-current opacity-50 ${colorClass}`} />
        <div className="flex items-start justify-between pl-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className={colorClass} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${colorClass}`}>
                {statusText}
              </span>
            </div>
            <h3 className="font-semibold text-[15px] mb-1 group-hover:text-primary transition-colors line-clamp-1">
              {pr.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              #{pr.prNumber} opened by <span className="text-foreground/80 font-medium">{pr.author}</span> • Updated {formatDistanceToNow(pr.updatedAt, { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {pr.reviews?.map((r: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1 text-xs px-2 py-1 bg-white/5 rounded-md">
                {r.state === "APPROVED" ? (
                  <CheckCircle2 size={12} className="text-emerald-500" />
                ) : r.state === "CHANGES_REQUESTED" ? (
                  <XCircle size={12} className="text-rose-500" />
                ) : (
                  <Clock size={12} className="text-muted-foreground" />
                )}
                <span className="opacity-70">{r.reviewer}</span>
              </div>
            ))}
          </div>
        </div>
      </a>
    );
  };

  const Section = ({ title, prs, type }: { title: string; prs: any[]; type: 'assigned' | 'awaiting' | 'stuck' | 'conflict' }) => {
    if (prs.length === 0) return null;
    return (
      <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <div className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-semibold">
            {prs.length}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prs.map(pr => (
            <PRCard key={pr._id} pr={pr} type={type} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="relative">
        <div className="absolute -top-20 right-1/4 w-[400px] h-[300px] bg-gradient-to-r from-purple-500/10 to-pink-500/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse duration-[10000ms]" />
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">PR & Review Insights</h1>
          <p className="text-sm text-muted-foreground">Actionable intelligence on your team's pull requests and code reviews.</p>
        </div>

        {assignedToMe.length === 0 && awaitingOthers.length === 0 && stuck.length === 0 && conflictBlocked.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-card/20 border border-border border-dashed rounded-2xl text-center">
            <GitPullRequest size={48} className="text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Inbox Zero!</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              You have no pending PRs to review, no stuck PRs, and no merge conflicts blocking your work.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <Section title="Blocked by Conflicts" prs={conflictBlocked} type="conflict" />
            <Section title="Assigned to You" prs={assignedToMe} type="assigned" />
            <Section title="Stuck (>48h Inactive)" prs={stuck} type="stuck" />
            <Section title="Your PRs Awaiting Review" prs={awaitingOthers} type="awaiting" />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
